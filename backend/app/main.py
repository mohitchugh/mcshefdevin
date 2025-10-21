from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
import uuid
import base64

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

chefs_db = {}
meals_db = {}
orders_db = {}
users_db = {}

class User(BaseModel):
    id: str
    email: str
    name: str
    role: str

class Chef(BaseModel):
    id: str
    user_id: str
    name: str
    email: str
    description: Optional[str] = None
    created_at: str

class MealCreate(BaseModel):
    chef_id: str
    name: str
    description: str
    price: float
    quantity: int
    container_size: str
    available_date: str
    image: Optional[str] = None

class Meal(BaseModel):
    id: str
    chef_id: str
    chef_name: str
    name: str
    description: str
    price: float
    quantity: int
    remaining_quantity: int
    container_size: str
    available_date: str
    image: Optional[str] = None
    created_at: str

class OrderCreate(BaseModel):
    meal_id: str
    user_id: str
    user_name: str
    user_email: str
    quantity: int

class Order(BaseModel):
    id: str
    meal_id: str
    meal_name: str
    chef_id: str
    chef_name: str
    user_id: str
    user_name: str
    user_email: str
    quantity: int
    price_per_item: float
    total_price: float
    chef_revenue: float
    platform_revenue: float
    status: str
    created_at: str

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/users")
async def create_or_get_user(user: User):
    if user.id in users_db:
        return users_db[user.id]
    users_db[user.id] = user.dict()
    return users_db[user.id]

@app.get("/api/users/{user_id}")
async def get_user(user_id: str):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return users_db[user_id]

@app.post("/api/chefs")
async def create_chef(chef: Chef):
    if chef.id in chefs_db:
        raise HTTPException(status_code=400, detail="Chef already exists")
    chef_data = chef.dict()
    chef_data["created_at"] = datetime.now().isoformat()
    chefs_db[chef.id] = chef_data
    return chef_data

@app.get("/api/chefs")
async def get_chefs():
    return list(chefs_db.values())

@app.get("/api/chefs/{chef_id}")
async def get_chef(chef_id: str):
    if chef_id not in chefs_db:
        raise HTTPException(status_code=404, detail="Chef not found")
    return chefs_db[chef_id]

@app.post("/api/meals")
async def create_meal(meal: MealCreate):
    if meal.chef_id not in chefs_db:
        raise HTTPException(status_code=404, detail="Chef not found")
    
    meal_id = str(uuid.uuid4())
    chef = chefs_db[meal.chef_id]
    
    meal_data = {
        "id": meal_id,
        "chef_id": meal.chef_id,
        "chef_name": chef["name"],
        "name": meal.name,
        "description": meal.description,
        "price": meal.price,
        "quantity": meal.quantity,
        "remaining_quantity": meal.quantity,
        "container_size": meal.container_size,
        "available_date": meal.available_date,
        "image": meal.image,
        "created_at": datetime.now().isoformat()
    }
    
    meals_db[meal_id] = meal_data
    return meal_data

@app.get("/api/meals")
async def get_meals(chef_id: Optional[str] = None, available_date: Optional[str] = None):
    meals = list(meals_db.values())
    
    if chef_id:
        meals = [m for m in meals if m["chef_id"] == chef_id]
    
    if available_date:
        meals = [m for m in meals if m["available_date"] == available_date]
    
    return meals

@app.get("/api/meals/{meal_id}")
async def get_meal(meal_id: str):
    if meal_id not in meals_db:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meals_db[meal_id]

@app.put("/api/meals/{meal_id}")
async def update_meal(meal_id: str, meal: MealCreate):
    if meal_id not in meals_db:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    existing_meal = meals_db[meal_id]
    chef = chefs_db[meal.chef_id]
    
    updated_meal = {
        "id": meal_id,
        "chef_id": meal.chef_id,
        "chef_name": chef["name"],
        "name": meal.name,
        "description": meal.description,
        "price": meal.price,
        "quantity": meal.quantity,
        "remaining_quantity": existing_meal["remaining_quantity"],
        "container_size": meal.container_size,
        "available_date": meal.available_date,
        "image": meal.image,
        "created_at": existing_meal["created_at"]
    }
    
    meals_db[meal_id] = updated_meal
    return updated_meal

@app.delete("/api/meals/{meal_id}")
async def delete_meal(meal_id: str):
    if meal_id not in meals_db:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    del meals_db[meal_id]
    return {"message": "Meal deleted successfully"}

@app.post("/api/orders")
async def create_order(order: OrderCreate):
    if order.meal_id not in meals_db:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    meal = meals_db[order.meal_id]
    
    if meal["remaining_quantity"] < order.quantity:
        raise HTTPException(status_code=400, detail="Not enough quantity available")
    
    order_id = str(uuid.uuid4())
    total_price = meal["price"] * order.quantity
    chef_revenue = total_price * 0.6
    platform_revenue = total_price * 0.4
    
    order_data = {
        "id": order_id,
        "meal_id": order.meal_id,
        "meal_name": meal["name"],
        "chef_id": meal["chef_id"],
        "chef_name": meal["chef_name"],
        "user_id": order.user_id,
        "user_name": order.user_name,
        "user_email": order.user_email,
        "quantity": order.quantity,
        "price_per_item": meal["price"],
        "total_price": total_price,
        "chef_revenue": chef_revenue,
        "platform_revenue": platform_revenue,
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    
    meal["remaining_quantity"] -= order.quantity
    meals_db[order.meal_id] = meal
    
    orders_db[order_id] = order_data
    return order_data

@app.get("/api/orders")
async def get_orders(user_id: Optional[str] = None, chef_id: Optional[str] = None):
    orders = list(orders_db.values())
    
    if user_id:
        orders = [o for o in orders if o["user_id"] == user_id]
    
    if chef_id:
        orders = [o for o in orders if o["chef_id"] == chef_id]
    
    return orders

@app.get("/api/orders/{order_id}")
async def get_order(order_id: str):
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found")
    return orders_db[order_id]

@app.get("/api/revenue/chef/{chef_id}")
async def get_chef_revenue(chef_id: str):
    chef_orders = [o for o in orders_db.values() if o["chef_id"] == chef_id]
    total_revenue = sum(o["chef_revenue"] for o in chef_orders)
    total_orders = len(chef_orders)
    
    return {
        "chef_id": chef_id,
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "orders": chef_orders
    }

@app.get("/api/revenue/platform")
async def get_platform_revenue():
    all_orders = list(orders_db.values())
    total_revenue = sum(o["platform_revenue"] for o in all_orders)
    total_orders = len(all_orders)
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "orders": all_orders
    }
