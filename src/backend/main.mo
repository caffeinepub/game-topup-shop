import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // ----- TYPES -----
  module Product {
    public type Product = {
      id : Nat;
      name : Text;
      category : Text;
      description : Text;
      price : Int;
      imageUrl : Text;
      isActive : Bool;
      isFeatured : Bool;
    };
  };

  module Order {
    public type OrderStatus = { #pending; #processing; #completed; #cancelled };

    public type Order = {
      id : Nat;
      userId : Principal;
      productId : Nat;
      gameId : Text;
      quantity : Nat;
      totalPrice : Int;
      status : OrderStatus;
      createdAt : Int;
    };
  };

  module RechargeRequest {
    public type PaymentMethod = { #bkash; #nagad; #rocket };
    public type RequestStatus = { #pending; #approved; #rejected };

    public type Request = {
      id : Nat;
      user : Principal;
      amount : Int;
      paymentMethod : PaymentMethod;
      transactionId : Text;
      status : RequestStatus;
      createdAt : Int;
    };
  };

  public type UserProfile = { name : Text };
  public type AdminLevel = { #superAdmin; #subAdmin; #none };

  public type SiteSettings = {
    siteName : Text;
    logoUrl : Text;
  };

  public type PaymentSettings = {
    bkash : Text;
    nagad : Text;
    rocket : Text;
  };

  public type Banner = {
    id : Nat;
    title : Text;
    description : Text;
    imageUrl : Text;
    isActive : Bool;
  };

  public type BannerInput = {
    title : Text;
    description : Text;
    imageUrl : Text;
    isActive : Bool;
  };

  public type MemberInfo = {
    principal : Principal;
    profile : ?UserProfile;
    adminLevel : AdminLevel;
  };

  public type ProductInput = {
    name : Text;
    category : Text;
    description : Text;
    price : Int;
    imageUrl : Text;
    isActive : Bool;
    isFeatured : Bool;
  };

  public type CreateOrderInput = {
    productId : Nat;
    gameId : Text;
    quantity : Nat;
  };

  public type OrderWithProduct = {
    id : Nat;
    userId : Principal;
    productId : Nat;
    gameId : Text;
    quantity : Nat;
    totalPrice : Int;
    status : Order.OrderStatus;
    createdAt : Int;
    product : Product.Product;
  };

  public type RechargeRequestInput = {
    amount : Int;
    paymentMethod : RechargeRequest.PaymentMethod;
    transactionId : Text;
  };

  // ----- STORAGE -----
  let products = Map.empty<Nat, Product.Product>();
  let orders = Map.empty<Nat, Order.Order>();
  let wallets = Map.empty<Principal, Int>();
  let rechargeRequests = Map.empty<Nat, RechargeRequest.Request>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let subAdmins = Map.empty<Principal, Bool>();
  let promotedSuperAdmins = Map.empty<Principal, Bool>();
  let knownUsers = Map.empty<Principal, Bool>();

  let banners = Map.empty<Nat, Banner>();

  var siteSettings : SiteSettings = {
    siteName = "Game Topup Shop";
    logoUrl = "";
  };

  var paymentSettings : PaymentSettings = {
    bkash = "01841956380";
    nagad = "01841956380";
    rocket = "01841956380";
  };

  var announcement : Text = "";

  var nextProductId = 1;
  var nextOrderId = 1;
  var nextRechargeRequestId = 1;
  var nextBannerId = 1;

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ----- AUTHORIZATION HELPERS -----
  func isOriginalAdmin(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  func isSuperAdmin(caller : Principal) : Bool {
    isOriginalAdmin(caller) or (
      switch (promotedSuperAdmins.get(caller)) {
        case (?true) { true };
        case (_) { false };
      }
    );
  };

  func isAdminOrSubAdmin(caller : Principal) : Bool {
    isSuperAdmin(caller) or (
      switch (subAdmins.get(caller)) {
        case (?true) { true };
        case (_) { false };
      }
    );
  };

  func trackUser(caller : Principal) {
    if (not knownUsers.containsKey(caller)) {
      knownUsers.add(caller, true);
    };
  };

  // ----- ADMIN LEVEL QUERIES -----
  public query ({ caller }) func getMyAdminLevel() : async AdminLevel {
    if (isSuperAdmin(caller)) { return #superAdmin };
    if (subAdmins.containsKey(caller)) { return #subAdmin };
    #none;
  };

  public query ({ caller }) func getUserAdminLevel(user : Principal) : async AdminLevel {
    if (isSuperAdmin(user)) { return #superAdmin };
    if (subAdmins.containsKey(user)) { return #subAdmin };
    #none;
  };

  // ----- ROLE MANAGEMENT (Super Admin only) -----
  public shared ({ caller }) func setSubAdmin(user : Principal, enable : Bool) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can manage sub-admins");
    };
    if (enable) {
      subAdmins.add(user, true);
      promotedSuperAdmins.remove(user);
    } else {
      subAdmins.remove(user);
    };
  };

  public shared ({ caller }) func setSuperAdminRole(user : Principal, enable : Bool) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can assign super admin role");
    };
    if (enable) {
      promotedSuperAdmins.add(user, true);
      subAdmins.remove(user);
    } else {
      promotedSuperAdmins.remove(user);
    };
  };

  // ----- GET ALL MEMBERS (Super Admin only) -----
  public query ({ caller }) func getAllMembers() : async [MemberInfo] {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can view all members");
    };

    let results = List.empty<MemberInfo>();

    for ((principal, _) in knownUsers.entries()) {
      let profile = userProfiles.get(principal);
      let adminLevel = if (isSuperAdmin(principal)) {
        #superAdmin;
      } else {
        switch (subAdmins.get(principal)) {
          case (?true) { #subAdmin };
          case (_) { #none };
        };
      };
      results.add({ principal; profile; adminLevel });
    };

    for ((principal, _) in promotedSuperAdmins.entries()) {
      if (not knownUsers.containsKey(principal)) {
        let profile = userProfiles.get(principal);
        results.add({ principal; profile; adminLevel = #superAdmin });
      };
    };

    for ((principal, _) in subAdmins.entries()) {
      if (
        not knownUsers.containsKey(principal) and
        not promotedSuperAdmins.containsKey(principal)
      ) {
        let profile = userProfiles.get(principal);
        results.add({ principal; profile; adminLevel = #subAdmin });
      };
    };

    results.toArray();
  };

  // ----- USER PROFILE -----
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    trackUser(caller);
    userProfiles.add(caller, profile);
  };

  // ----- PRODUCTS -----
  public shared ({ caller }) func addProduct(input : ProductInput) : async Nat {
    if (not isAdminOrSubAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let newProduct : Product.Product = {
      id = nextProductId;
      name = input.name;
      category = input.category;
      description = input.description;
      price = input.price;
      imageUrl = input.imageUrl;
      isActive = input.isActive;
      isFeatured = input.isFeatured;
    };

    products.add(nextProductId, newProduct);
    nextProductId += 1;
    newProduct.id;
  };

  public shared ({ caller }) func updateProduct(
    productId : Nat,
    input : ProductInput,
  ) : async () {
    if (not isAdminOrSubAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let updatedProduct : Product.Product = {
          id = productId;
          name = input.name;
          category = input.category;
          description = input.description;
          price = input.price;
          imageUrl = input.imageUrl;
          isActive = input.isActive;
          isFeatured = input.isFeatured;
        };
        products.add(productId, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not isAdminOrSubAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };
    products.remove(productId);
  };

  public query ({ caller }) func getProducts() : async [Product.Product] {
    let iter = products.values();
    iter.toArray();
  };

  public query ({ caller }) func getFeaturedProducts() : async [Product.Product] {
    let iter = products.values().filter(
      func(product) { product.isFeatured and product.isActive }
    );
    iter.toArray();
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product.Product] {
    let iter = products.values().filter(
      func(product) { product.category == category and product.isActive }
    );
    iter.toArray();
  };

  // ----- ORDERS -----
  public shared ({ caller }) func placeOrder(input : CreateOrderInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    trackUser(caller);

    switch (products.get(input.productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let totalPrice = product.price * input.quantity;
        let currentBalance = switch (wallets.get(caller)) {
          case (null) { 0 };
          case (?balance) { balance };
        };

        if (currentBalance < totalPrice) {
          Runtime.trap("Insufficient wallet balance");
        };

        let newOrder : Order.Order = {
          id = nextOrderId;
          userId = caller;
          productId = input.productId;
          gameId = input.gameId;
          quantity = input.quantity;
          totalPrice;
          status = #pending;
          createdAt = Time.now();
        };

        orders.add(nextOrderId, newOrder);
        wallets.add(caller, currentBalance - totalPrice);
        nextOrderId += 1;
        newOrder.id;
      };
    };
  };

  public query ({ caller }) func getMyOrders() : async [OrderWithProduct] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let userOrders = List.empty<Order.Order>();

    for ((_, order) in orders.entries()) {
      if (order.userId == caller) {
        userOrders.add(order);
      };
    };

    let mappedIter = userOrders.values().map(
      func(order) {
        switch (products.get(order.productId)) {
          case (null) { null };
          case (?product) {
            ?{
              id = order.id;
              userId = order.userId;
              productId = order.productId;
              gameId = order.gameId;
              quantity = order.quantity;
              totalPrice = order.totalPrice;
              status = order.status;
              createdAt = order.createdAt;
              product;
            };
          };
        };
      }
    );

    let filteredIter = mappedIter.filter(
      func(optOrder) { switch (optOrder) { case (?_) { true }; case (null) { false } } }
    );

    let finalIter = filteredIter.map(
      func(optOrder) {
        switch (optOrder) {
          case (null) { Runtime.trap("Unexpected: null OrderWithProduct") };
          case (?order) { order };
        };
      }
    );
    finalIter.toArray();
  };

  public query ({ caller }) func getAllOrders() : async [OrderWithProduct] {
    if (not isAdminOrSubAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    let allOrders = List.empty<Order.Order>();

    for ((_, order) in orders.entries()) {
      allOrders.add(order);
    };

    let mappedIter = allOrders.values().map(
      func(order) {
        switch (products.get(order.productId)) {
          case (null) { null };
          case (?product) {
            ?{
              id = order.id;
              userId = order.userId;
              productId = order.productId;
              gameId = order.gameId;
              quantity = order.quantity;
              totalPrice = order.totalPrice;
              status = order.status;
              createdAt = order.createdAt;
              product;
            };
          };
        };
      }
    );

    let filteredIter = mappedIter.filter(
      func(optOrder) { switch (optOrder) { case (?_) { true }; case (null) { false } } }
    );

    let finalIter = filteredIter.map(
      func(optOrder) {
        switch (optOrder) {
          case (null) { Runtime.trap("Unexpected: null OrderWithProduct") };
          case (?order) { order };
        };
      }
    );
    finalIter.toArray();
  };

  public shared ({ caller }) func updateOrderStatus(
    orderId : Nat,
    newStatus : Order.OrderStatus,
  ) : async () {
    if (not isAdminOrSubAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order.Order = {
          id = order.id;
          userId = order.userId;
          productId = order.productId;
          gameId = order.gameId;
          quantity = order.quantity;
          totalPrice = order.totalPrice;
          status = newStatus;
          createdAt = order.createdAt;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  // ----- WALLET -----
  public query ({ caller }) func getWalletBalance() : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wallet balance");
    };
    switch (wallets.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
  };

  public shared ({ caller }) func creditWallet(
    user : Principal,
    amount : Int,
  ) : async () {
    if (not isAdminOrSubAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can credit wallets");
    };

    let currentBalance = switch (wallets.get(user)) {
      case (null) { 0 };
      case (?balance) { balance };
    };

    wallets.add(user, currentBalance + amount);
  };

  // ----- RECHARGE -----
  public query ({ caller }) func getRechargeRequests() : async [RechargeRequest.Request] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view recharge requests");
    };
    let requests = List.empty<RechargeRequest.Request>();

    for ((_, request) in rechargeRequests.entries()) {
      if (isAdminOrSubAdmin(caller) or request.user == caller) {
        requests.add(request);
      };
    };

    let array = requests.toArray();
    array.reverse();
  };

  public shared ({ caller }) func submitRechargeRequest(
    input : RechargeRequestInput,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit recharge requests");
    };
    trackUser(caller);

    let newRequest : RechargeRequest.Request = {
      id = nextRechargeRequestId;
      user = caller;
      amount = input.amount;
      paymentMethod = input.paymentMethod;
      transactionId = input.transactionId;
      status = #pending;
      createdAt = Time.now();
    };

    rechargeRequests.add(nextRechargeRequestId, newRequest);
    nextRechargeRequestId += 1;
    newRequest.id;
  };

  public shared ({ caller }) func approveRechargeRequest(requestId : Nat) : async () {
    if (not isAdminOrSubAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can approve recharge requests");
    };

    switch (rechargeRequests.get(requestId)) {
      case (null) { Runtime.trap("Recharge request not found") };
      case (?request) {
        let updatedRequest : RechargeRequest.Request = {
          id = request.id;
          user = request.user;
          amount = request.amount;
          paymentMethod = request.paymentMethod;
          transactionId = request.transactionId;
          status = #approved;
          createdAt = request.createdAt;
        };
        rechargeRequests.add(requestId, updatedRequest);

        let currentBalance = switch (wallets.get(request.user)) {
          case (null) { 0 };
          case (?balance) { balance };
        };
        wallets.add(request.user, currentBalance + request.amount);
      };
    };
  };

  public shared ({ caller }) func rejectRechargeRequest(requestId : Nat) : async () {
    if (not isAdminOrSubAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can reject recharge requests");
    };

    switch (rechargeRequests.get(requestId)) {
      case (null) { Runtime.trap("Recharge request not found") };
      case (?request) {
        let updatedRequest : RechargeRequest.Request = {
          id = request.id;
          user = request.user;
          amount = request.amount;
          paymentMethod = request.paymentMethod;
          transactionId = request.transactionId;
          status = #rejected;
          createdAt = request.createdAt;
        };
        rechargeRequests.add(requestId, updatedRequest);
      };
    };
  };

  // ----- ANNOUNCEMENT (Super Admin only) -----
  public shared ({ caller }) func setAnnouncement(text : Text) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can set announcements");
    };
    announcement := text;
  };

  public query ({ caller }) func getAnnouncement() : async Text {
    announcement;
  };

  // ----- SETUP SAMPLE DATA -----
  public shared ({ caller }) func initializeSampleData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize data");
    };

    let ffDiamonds : ProductInput = {
      name = "Free Fire 100 Diamonds";
      category = "Free Fire";
      description = "100 Diamonds for Free Fire Mobile";
      price = 100;
      imageUrl = "https://example.com/ff100.png";
      isActive = true;
      isFeatured = true;
    };

    let pubgUc : ProductInput = {
      name = "PUBG 60 UC";
      category = "PUBG";
      description = "60 Unknown Cash for PUBG Mobile";
      price = 150;
      imageUrl = "https://example.com/pubg60.png";
      isActive = true;
      isFeatured = false;
    };

    let mlDiamonds : ProductInput = {
      name = "Mobile Legends 50 Diamonds";
      category = "Mobile Legends";
      description = "50 Diamonds for MLBB";
      price = 120;
      imageUrl = "https://example.com/ml50.png";
      isActive = true;
      isFeatured = true;
    };

    let specialDiscount : ProductInput = {
      name = "Special Discount Offer";
      category = "Special Offer";
      description = "Super discount offer on selected game items";
      price = 80;
      imageUrl = "/assets/generated/special-discount-offer.dim_400x400.jpg";
      isActive = true;
      isFeatured = true;
    };

    let ff100Like : ProductInput = {
      name = "Free Fire - 100 Like প্রতিদিন ১ বার";
      category = "Free Fire";
      description = "Get 100 Free Fire likes daily, 1 time per ID";
      price = 50;
      imageUrl = "/assets/generated/ff-100-like.dim_400x400.jpg";
      isActive = true;
      isFeatured = true;
    };

    let mysteryBox : ProductInput = {
      name = "MYSTERY BOX";
      category = "Free Fire";
      description = "Free Fire মিস্ট্রি বক্স - Auto Delivery";
      price = 200;
      imageUrl = "/assets/generated/ff-mystery-box.dim_400x400.jpg";
      isActive = true;
      isFeatured = true;
    };

    let luckyBonus : ProductInput = {
      name = "LUCKY BONUS EVENT";
      category = "Special Offer";
      description = "Lucky Bonus Top-Up - Win up to 1689 diamonds";
      price = 300;
      imageUrl = "/assets/generated/lucky-bonus-event.dim_400x400.jpg";
      isActive = true;
      isFeatured = true;
    };

    ignore await addProduct(ffDiamonds);
    ignore await addProduct(pubgUc);
    ignore await addProduct(mlDiamonds);
    ignore await addProduct(specialDiscount);
    ignore await addProduct(ff100Like);
    ignore await addProduct(mysteryBox);
    ignore await addProduct(luckyBonus);
  };

  // --- SITE SETTINGS (Super Admin only) ---
  public query ({ caller }) func getSiteSettings() : async SiteSettings {
    siteSettings;
  };

  public shared ({ caller }) func setSiteSettings(settings : SiteSettings) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can set site settings");
    };
    siteSettings := settings;
  };

  public query ({ caller }) func getPaymentSettings() : async PaymentSettings {
    paymentSettings;
  };

  public shared ({ caller }) func setPaymentSettings(settings : PaymentSettings) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can set payment settings");
    };
    paymentSettings := settings;
  };

  // --- BANNERS ---
  public query ({ caller }) func getBanners() : async [Banner] {
    let values = banners.values();
    values.toArray();
  };

  public shared ({ caller }) func addBanner(input : BannerInput) : async Nat {
    if (not isAdminOrSubAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add banners");
    };
    let newBanner : Banner = {
      id = nextBannerId;
      title = input.title;
      description = input.description;
      imageUrl = input.imageUrl;
      isActive = input.isActive;
    };
    banners.add(nextBannerId, newBanner);
    nextBannerId += 1;
    newBanner.id;
  };

  public shared ({ caller }) func updateBanner(
    id : Nat,
    input : BannerInput,
  ) : async () {
    if (not isAdminOrSubAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update banners");
    };
    switch (banners.get(id)) {
      case (null) { Runtime.trap("Banner not found") };
      case (?_) {
        let updatedBanner : Banner = {
          id;
          title = input.title;
          description = input.description;
          imageUrl = input.imageUrl;
          isActive = input.isActive;
        };
        banners.add(id, updatedBanner);
      };
    };
  };

  public shared ({ caller }) func deleteBanner(id : Nat) : async () {
    if (not isAdminOrSubAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete banners");
    };
    if (not banners.containsKey(id)) {
      Runtime.trap("Banner not found");
    };
    banners.remove(id);
  };
};
