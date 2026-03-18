import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // ----- Types -----
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

  public type UserProfile = {
    name : Text;
  };

  // ------ Storage ------
  let products = Map.empty<Nat, Product.Product>();
  let orders = Map.empty<Nat, Order.Order>();
  let wallets = Map.empty<Principal, Int>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextProductId = 1;
  var nextOrderId = 1;
  var announcement : Text = "";

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ------ User Profile Management ------
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
    userProfiles.add(caller, profile);
  };

  // ------ Product Management (Admin Only) -------
  public type ProductInput = {
    name : Text;
    category : Text;
    description : Text;
    price : Int;
    imageUrl : Text;
    isActive : Bool;
    isFeatured : Bool;
  };

  public shared ({ caller }) func addProduct(input : ProductInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found. ");
    };
    products.remove(productId);
  };

  // ------ Product Listing (Public) -------
  public query ({ caller }) func getProducts() : async [Product.Product] {
    let productIter = products.values();
    productIter.toArray();
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

  // ------ Order Management (Users) -------
  public type CreateOrderInput = {
    productId : Nat;
    gameId : Text;
    quantity : Nat;
  };

  public shared ({ caller }) func placeOrder(input : CreateOrderInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    switch (products.get(input.productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let totalPrice = product.price * input.quantity;
        let currentBalance = switch (wallets.get(caller)) {
          case (null) { 0 };
          case (?balance) { balance };
        };

        if (currentBalance < totalPrice) {
          Runtime.trap("Insufficient wallet balance. ");
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
        let product = switch (products.get(order.productId)) {
          case (null) { Runtime.trap("Product not found. ") };
          case (?p) { p };
        };
        {
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
      }
    );

    mappedIter.toArray();
  };

  // ------ Order Management (Admin) -------
  public query ({ caller }) func getAllOrders() : async [OrderWithProduct] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    let allOrders = List.empty<Order.Order>();

    for ((_, order) in orders.entries()) {
      allOrders.add(order);
    };

    let mappedIter = allOrders.values().map(
      func(order) {
        let product = switch (products.get(order.productId)) {
          case (null) { Runtime.trap("Product not found. ") };
          case (?p) { p };
        };
        {
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
      }
    );

    mappedIter.toArray();
  };

  public shared ({ caller }) func updateOrderStatus(
    orderId : Nat,
    newStatus : Order.OrderStatus,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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

  // ------ Wallet Management -------
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can credit wallets");
    };

    let currentBalance = switch (wallets.get(user)) {
      case (null) { 0 };
      case (?balance) { balance };
    };

    wallets.add(user, currentBalance + amount);
  };

  // ------ Announcement (Admin Only) -------
  public shared ({ caller }) func setAnnouncement(text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set announcements");
    };

    announcement := text;
  };

  public query ({ caller }) func getAnnouncement() : async Text {
    announcement;
  };

  // ------ Initialize Sample Data -------
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

    ignore await addProduct(ffDiamonds);
    ignore await addProduct(pubgUc);
    ignore await addProduct(mlDiamonds);
  };
};
