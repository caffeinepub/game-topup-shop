import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  // Product types for migration
  type OldProduct = {
    id : Nat;
    name : Text;
    category : Text;
    description : Text;
    price : Int;
    imageUrl : Text;
    isActive : Bool;
    isFeatured : Bool;
  };

  // Order types for migration
  type OldOrder = {
    id : Nat;
    userId : Principal;
    productId : Nat;
    gameId : Text;
    quantity : Nat;
    totalPrice : Int;
    status : { #pending; #processing; #completed; #cancelled };
    createdAt : Int;
  };

  // User profile type for migration
  type OldUserProfile = {
    name : Text;
  };

  // Actor state types for migration
  type OldActor = {
    products : Map.Map<Nat, OldProduct>;
    orders : Map.Map<Nat, OldOrder>;
    wallets : Map.Map<Principal, Int>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    nextProductId : Nat;
    nextOrderId : Nat;
    announcement : Text;
  };

  // Recharge request types for migration
  type PaymentMethod = { #bkash; #nagad; #rocket };
  type RequestStatus = { #pending; #approved; #rejected };
  type RechargeRequest = {
    id : Nat;
    user : Principal;
    amount : Int;
    paymentMethod : PaymentMethod;
    transactionId : Text;
    status : RequestStatus;
    createdAt : Int;
  };

  // New actor state type for migration
  type NewActor = {
    products : Map.Map<Nat, OldProduct>;
    orders : Map.Map<Nat, OldOrder>;
    wallets : Map.Map<Principal, Int>;
    rechargeRequests : Map.Map<Nat, RechargeRequest>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    nextProductId : Nat;
    nextOrderId : Nat;
    announcement : Text;
    nextRechargeRequestId : Nat;
  };

  // Migration function to add rechargeRequests and nextRechargeRequestId
  public func run(old : OldActor) : NewActor {
    {
      old with
      rechargeRequests = Map.empty<Nat, RechargeRequest>();
      nextRechargeRequestId = 1;
    };
  };
};
