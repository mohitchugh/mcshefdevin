import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChefHat, ShoppingBag } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-orange-600 mb-4">McShef</h1>
          <p className="text-2xl text-gray-700">Home-Cooked Meals, Delivered Fresh</p>
          <p className="text-lg text-gray-600 mt-2">Supporting local home chefs, one meal at a time</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/customer')}>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <ShoppingBag className="w-16 h-16 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-center">Customer Portal</CardTitle>
              <CardDescription className="text-center">Browse and order delicious home-cooked meals</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => navigate('/customer')}>
                Order Meals
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/chef')}>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <ChefHat className="w-16 h-16 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-center">Chef Portal</CardTitle>
              <CardDescription className="text-center">Share your culinary creations with the community</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => navigate('/chef')}>
                Start Cooking
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-orange-600 mb-2">1</div>
              <h3 className="text-xl font-semibold mb-2">Chefs Cook</h3>
              <p className="text-gray-600">Home chefs prepare delicious meals and list them on our platform</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-orange-600 mb-2">2</div>
              <h3 className="text-xl font-semibold mb-2">Customers Order</h3>
              <p className="text-gray-600">Browse available meals and place your order</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-orange-600 mb-2">3</div>
              <h3 className="text-xl font-semibold mb-2">We Deliver</h3>
              <p className="text-gray-600">McShef handles pickup and delivery to your door</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
