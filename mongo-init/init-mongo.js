db = db.getSiblingDB("admin");

db.createUser({
  user: "root",
  pwd: "rootpassword",
  roles: [
    { role: "root", db: "admin" }
  ]
});