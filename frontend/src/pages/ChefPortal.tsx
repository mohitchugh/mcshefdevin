import { useState, useEffect } from 'react'
import { useOktaAuth } from '@okta/okta-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Home, LogOut, Plus, DollarSign, Package } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

interface Chef {
  id: string
  user_id: string
  name: string
  email: string
  description?: string
  created_at: string
}

interface Meal {
  id: string
  chef_id: string
  chef_name: string
  name: string
  description: string
  price: number
  quantity: number
  remaining_quantity: number
  container_size: string
  available_date: string
  image?: string
  created_at: string
}

interface Order {
  id: string
  meal_name: string
  user_name: string
  user_email: string
  quantity: number
  total_price: number
  chef_revenue: number
  status: string
  created_at: string
}

export default function ChefPortal() {
  const { oktaAuth, authState } = useOktaAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [chef, setChef] = useState<Chef | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [revenue, setRevenue] = useState<number>(0)
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [loading, setLoading] = useState(true)

  const [newMeal, setNewMeal] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    container_size: '',
    available_date: new Date().toISOString().split('T')[0],
    image: ''
  })

  useEffect(() => {
    if (authState?.isAuthenticated) {
      loadUserInfo()
    }
  }, [authState])

  useEffect(() => {
    if (user) {
      loadOrCreateChef()
    }
  }, [user])

  useEffect(() => {
    if (chef) {
      loadMeals()
      loadOrders()
      loadRevenue()
    }
  }, [chef])

  const loadUserInfo = async () => {
    try {
      const userInfo = await oktaAuth.getUser()
      const userData = {
        id: userInfo.sub || '',
        email: userInfo.email || '',
        name: userInfo.name || '',
        role: 'chef'
      }
      
      await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      
      setUser(userData)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadOrCreateChef = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chefs`)
      const chefs = await response.json()
      let existingChef = chefs.find((c: Chef) => c.user_id === user.id)

      if (!existingChef) {
        const createResponse = await fetch(`${API_URL}/api/chefs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            user_id: user.id,
            name: user.name,
            email: user.email,
            description: '',
            created_at: new Date().toISOString()
          })
        })
        existingChef = await createResponse.json()
      }

      setChef(existingChef)
      setLoading(false)
    } catch (error) {
      console.error('Error loading chef:', error)
      setLoading(false)
    }
  }

  const loadMeals = async () => {
    try {
      const response = await fetch(`${API_URL}/api/meals?chef_id=${chef?.id}`)
      const data = await response.json()
      setMeals(data)
    } catch (error) {
      console.error('Error loading meals:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders?chef_id=${chef?.id}`)
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const loadRevenue = async () => {
    try {
      const response = await fetch(`${API_URL}/api/revenue/chef/${chef?.id}`)
      const data = await response.json()
      setRevenue(data.total_revenue)
    } catch (error) {
      console.error('Error loading revenue:', error)
    }
  }

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!chef) return

    try {
      const response = await fetch(`${API_URL}/api/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chef_id: chef.id,
          name: newMeal.name,
          description: newMeal.description,
          price: parseFloat(newMeal.price),
          quantity: parseInt(newMeal.quantity),
          container_size: newMeal.container_size,
          available_date: newMeal.available_date,
          image: newMeal.image || null
        })
      })

      if (response.ok) {
        alert('Meal added successfully!')
        setShowAddMeal(false)
        setNewMeal({
          name: '',
          description: '',
          price: '',
          quantity: '',
          container_size: '',
          available_date: new Date().toISOString().split('T')[0],
          image: ''
        })
        loadMeals()
      } else {
        alert('Failed to add meal')
      }
    } catch (error) {
      console.error('Error adding meal:', error)
      alert('Failed to add meal')
    }
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return

    try {
      const response = await fetch(`${API_URL}/api/meals/${mealId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Meal deleted successfully!')
        loadMeals()
      } else {
        alert('Failed to delete meal')
      }
    } catch (error) {
      console.error('Error deleting meal:', error)
      alert('Failed to delete meal')
    }
  }

  const handleLogout = async () => {
    await oktaAuth.signOut()
  }

  if (!authState?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the chef portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="bg-orange-600 hover:bg-orange-700">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-600">McShef - Chef Portal</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome, Chef {chef?.name}!</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">${revenue.toFixed(2)}</p>
                <p className="text-sm text-gray-600">60% of total sales</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Active Meals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">{meals.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
              </CardContent>
            </Card>
          </div>

          <Button onClick={() => setShowAddMeal(!showAddMeal)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Meal
          </Button>
        </div>

        {showAddMeal && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Meal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMeal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Meal Name</label>
                  <Input
                    required
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                    placeholder="e.g., Homemade Lasagna"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    required
                    value={newMeal.description}
                    onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                    placeholder="Describe your meal..."
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price ($)</label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      value={newMeal.price}
                      onChange={(e) => setNewMeal({ ...newMeal, price: e.target.value })}
                      placeholder="15.99"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <Input
                      required
                      type="number"
                      value={newMeal.quantity}
                      onChange={(e) => setNewMeal({ ...newMeal, quantity: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Container Size</label>
                    <Input
                      required
                      value={newMeal.container_size}
                      onChange={(e) => setNewMeal({ ...newMeal, container_size: e.target.value })}
                      placeholder="e.g., Large (32oz)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Available Date</label>
                    <Input
                      required
                      type="date"
                      value={newMeal.available_date}
                      onChange={(e) => setNewMeal({ ...newMeal, available_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
                  <Input
                    value={newMeal.image}
                    onChange={(e) => setNewMeal({ ...newMeal, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                    Add Meal
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddMeal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">My Meals</h3>
            {meals.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-600">
                  No meals yet. Add your first meal to get started!
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {meals.map((meal) => (
                  <Card key={meal.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{meal.name}</CardTitle>
                          <CardDescription>Available: {meal.available_date}</CardDescription>
                        </div>
                        <Badge variant={meal.remaining_quantity > 0 ? 'default' : 'secondary'}>
                          {meal.remaining_quantity} / {meal.quantity} left
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-2">{meal.description}</p>
                      <p className="text-sm text-gray-600 mb-2">Container: {meal.container_size}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xl font-bold text-orange-600">${meal.price.toFixed(2)}</p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMeal(meal.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Orders</h3>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-600">
                  No orders yet. Keep cooking!
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.slice(0, 10).map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{order.meal_name}</CardTitle>
                      <CardDescription>
                        {order.user_name} ({order.user_email})
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                      <p className="text-sm text-gray-600">Total: ${order.total_price.toFixed(2)}</p>
                      <p className="text-lg font-bold text-green-600">
                        Your Revenue: ${order.chef_revenue.toFixed(2)}
                      </p>
                      <Badge className="mt-2">{order.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
