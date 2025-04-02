"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Leaf, Utensils, Apple, ShoppingCart, Recycle, Heart, Info } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SustainableDiet() {
  const router = useRouter()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Sustainable Diet Guide</h2>
        <p className="text-gray-500">Learn how to eat healthily and sustainably</p>
      </div>

      <Tabs defaultValue="principles">
        <TabsList className="mb-6">
          <TabsTrigger value="principles">Key Principles</TabsTrigger>
          <TabsTrigger value="meal-planning">Meal Planning</TabsTrigger>
          <TabsTrigger value="shopping">Shopping Tips</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="principles">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="mr-2 h-5 w-5 text-green-500" />
                  Sustainable Diet Principles
                </CardTitle>
                <CardDescription>Core principles for a healthy and sustainable diet</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Plant-Forward Eating</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        Emphasize plant foods like fruits, vegetables, whole grains, legumes, nuts, and seeds. These
                        foods generally have a lower environmental impact than animal products and provide essential
                        nutrients.
                      </p>
                      <p>
                        You don't need to be fully vegetarian or vegan, but reducing animal product consumption can
                        significantly lower your environmental footprint.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>Minimize Food Waste</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        About one-third of all food produced globally is wasted. Reducing food waste is one of the most
                        effective ways to decrease your environmental impact.
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Plan meals and shop with a list</li>
                        <li>Store food properly to extend freshness</li>
                        <li>Use leftovers creatively</li>
                        <li>Compost food scraps when possible</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>Choose Seasonal and Local</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        Seasonal and locally grown foods often have a lower carbon footprint as they require less
                        transportation, storage, and artificial growing conditions.
                      </p>
                      <p>
                        Shopping at farmers' markets or joining a CSA (Community Supported Agriculture) program can help
                        you access fresh, local produce while supporting local farmers.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>Diversify Your Diet</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        Eating a wide variety of foods ensures you get all the nutrients you need and supports
                        biodiversity in our food systems.
                      </p>
                      <p>
                        Try incorporating different whole grains (quinoa, farro, barley), legumes (lentils, chickpeas,
                        beans), and vegetables into your meals.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>Mindful Protein Choices</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        When consuming animal products, choose those with lower environmental impacts:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Poultry and eggs generally have lower impacts than red meat</li>
                        <li>Sustainably sourced seafood can be a good option</li>
                        <li>
                          Plant proteins like beans, lentils, tofu, and tempeh have the lowest environmental footprint
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-red-500" />
                  Health Benefits
                </CardTitle>
                <CardDescription>How sustainable eating improves your health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-medium text-green-800 mb-2">Reduced Chronic Disease Risk</h3>
                  <p className="text-sm text-green-700">
                    Plant-forward diets are associated with lower risks of heart disease, type 2 diabetes, certain
                    cancers, and obesity. The high fiber content helps maintain healthy digestion and weight.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">Improved Nutrient Intake</h3>
                  <p className="text-sm text-blue-700">
                    Diverse, whole-food diets provide a wide range of vitamins, minerals, antioxidants, and
                    phytonutrients that support overall health and immune function.
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="font-medium text-purple-800 mb-2">Better Gut Health</h3>
                  <p className="text-sm text-purple-700">
                    Plant-based diets rich in fiber feed beneficial gut bacteria, supporting a healthy microbiome which
                    is linked to improved digestion, immunity, and even mental health.
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <h3 className="font-medium text-amber-800 mb-2">Healthier Weight Management</h3>
                  <p className="text-sm text-amber-700">
                    Whole, plant foods are typically lower in calories and higher in fiber than processed foods, making
                    it easier to maintain a healthy weight without counting calories.
                  </p>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => router.push("/records?tab=meal-recommendations")}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    Get Personalized Meal Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meal-planning">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Utensils className="mr-2 h-5 w-5 text-orange-500" />
                Sustainable Meal Planning
              </CardTitle>
              <CardDescription>Tips for planning sustainable and healthy meals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Weekly Meal Planning</h3>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">1. Start with a plant-based foundation</h4>
                    <p className="text-sm text-gray-600">
                      Build your meals around vegetables, fruits, whole grains, and legumes. Aim to fill at least half
                      your plate with vegetables and fruits.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">2. Plan for leftovers</h4>
                    <p className="text-sm text-gray-600">
                      Cook once, eat twice. Make larger batches and repurpose leftovers into new meals to reduce cooking
                      time and energy use.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">3. Embrace "root-to-stem" cooking</h4>
                    <p className="text-sm text-gray-600">
                      Use all edible parts of produce. Beet greens, broccoli stems, and carrot tops can all be
                      incorporated into meals rather than discarded.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">4. Designate low-impact days</h4>
                    <p className="text-sm text-gray-600">
                      Start with "Meatless Monday" and gradually add more plant-based days to your week as you become
                      comfortable with new recipes.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Sample Meal Framework</h3>

                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-green-100 p-3">
                        <h4 className="font-medium">Breakfast</h4>
                      </div>
                      <div className="p-3">
                        <ul className="text-sm space-y-2">
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            Whole grain base (oats, whole grain toast, etc.)
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            Fruit (seasonal, local when possible)
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            Protein source (nuts, seeds, yogurt, eggs)
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-amber-100 p-3">
                        <h4 className="font-medium">Lunch</h4>
                      </div>
                      <div className="p-3">
                        <ul className="text-sm space-y-2">
                          <li className="flex items-start">
                            <span className="text-amber-500 mr-2">•</span>
                            Vegetables (at least 2 varieties)
                          </li>
                          <li className="flex items-start">
                            <span className="text-amber-500 mr-2">•</span>
                            Whole grain or starchy vegetable
                          </li>
                          <li className="flex items-start">
                            <span className="text-amber-500 mr-2">•</span>
                            Plant protein (beans, lentils, tofu) or small portion of animal protein
                          </li>
                          <li className="flex items-start">
                            <span className="text-amber-500 mr-2">•</span>
                            Healthy fat (olive oil, avocado, nuts)
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-blue-100 p-3">
                        <h4 className="font-medium">Dinner</h4>
                      </div>
                      <div className="p-3">
                        <ul className="text-sm space-y-2">
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Vegetables (at least half the plate)
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Whole grain or starchy vegetable (quarter of the plate)
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Protein source (quarter of the plate)
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Herbs and spices for flavor
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={() => router.push("/")} className="w-full bg-green-500 hover:bg-green-600">
                  Browse Our Sustainable Meal Options
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shopping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5 text-blue-500" />
                Sustainable Shopping Guide
              </CardTitle>
              <CardDescription>How to shop for sustainable and healthy foods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Shopping Strategies</h3>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Apple className="mr-2 h-4 w-4 text-green-500" />
                        Prioritize Whole Foods
                      </h4>
                      <p className="text-sm text-gray-600">
                        Focus on unprocessed or minimally processed foods. Shop primarily in the perimeter of the
                        grocery store where fresh produce, bulk foods, and refrigerated items are typically located.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Recycle className="mr-2 h-4 w-4 text-blue-500" />
                        Reduce Packaging Waste
                      </h4>
                      <p className="text-sm text-gray-600">
                        Bring reusable bags, containers, and produce bags. Buy in bulk when possible to minimize
                        packaging. Choose products with recyclable or compostable packaging.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Info className="mr-2 h-4 w-4 text-purple-500" />
                        Read Labels Carefully
                      </h4>
                      <p className="text-sm text-gray-600">
                        Look for certifications like USDA Organic, Fair Trade, Rainforest Alliance, and Marine
                        Stewardship Council. Be aware of greenwashing and learn what different claims actually mean.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Sustainable Food Choices</h3>

                  <div className="space-y-4">
                    <div className="border p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Produce</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Choose seasonal and locally grown when possible
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Consider organic for items on the "Dirty Dozen" list
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Don't reject "ugly" produce - it's perfectly edible
                        </li>
                      </ul>
                    </div>

                    <div className="border p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Protein Sources</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Prioritize plant proteins: beans, lentils, tofu, tempeh
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          For animal proteins, choose pasture-raised, grass-fed, or certified humane
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          For seafood, check the Seafood Watch guide for sustainable options
                        </li>
                      </ul>
                    </div>

                    <div className="border p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Grains & Staples</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Buy whole grains in bulk to reduce packaging
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Choose less processed options (brown rice vs. white)
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Explore diverse grains: quinoa, farro, millet, amaranth
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
              <CardDescription>Tools and information to support your sustainable eating journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recommended Apps</h3>

                  <div className="border p-4 rounded-lg">
                    <h4 className="font-medium">Food Waste Reduction</h4>
                    <ul className="mt-2 space-y-2">
                      <li className="text-sm">
                        <span className="font-medium">Too Good To Go:</span> Connect with local restaurants and stores
                        to purchase surplus food at a discount
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Olio:</span> Share unwanted food with neighbors instead of
                        throwing it away
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">NoWaste:</span> Track food inventory and expiration dates to
                        reduce waste
                      </li>
                    </ul>
                  </div>

                  <div className="border p-4 rounded-lg">
                    <h4 className="font-medium">Sustainable Shopping</h4>
                    <ul className="mt-2 space-y-2">
                      <li className="text-sm">
                        <span className="font-medium">HowGood:</span> Scan products to see sustainability ratings
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Seafood Watch:</span> Find sustainable seafood options
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Seasonal Food Guide:</span> Find what's in season in your area
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recommended Reading</h3>

                  <div className="border p-4 rounded-lg">
                    <h4 className="font-medium">Books</h4>
                    <ul className="mt-2 space-y-2">
                      <li className="text-sm">
                        <span className="font-medium">"How Not to Die"</span> by Dr. Michael Greger
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">"In Defense of Food"</span> by Michael Pollan
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">"The Blue Zones Kitchen"</span> by Dan Buettner
                      </li>
                    </ul>
                  </div>

                  <div className="border p-4 rounded-lg">
                    <h4 className="font-medium">Websites & Organizations</h4>
                    <ul className="mt-2 space-y-2">
                      <li className="text-sm">
                        <span className="font-medium">EAT-Lancet Commission:</span> Scientific research on healthy and
                        sustainable diets
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Food Print:</span> Information on the environmental impact of food
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">World Resources Institute:</span> Research on sustainable food
                        systems
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => router.push("/records?tab=meal-recommendations")}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Get Personalized Meal Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

