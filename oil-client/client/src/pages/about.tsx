import { Card, CardContent } from "@/components/ui/card";
import { Leaf, FlaskConical, Heart, Users, Award, Sparkles } from "lucide-react";

export default function About() {
  const stats = [
    { label: "Happy Customers", value: "5M+", icon: Users },
    { label: "Products", value: "100+", icon: Sparkles },
    { label: "Average Rating", value: "4.7★", icon: Award },
  ];

  const values = [
    {
      icon: Leaf,
      title: "Natural & Clean",
      description: "We use natural ingredients and avoid harmful chemicals in all our formulations.",
    },
    {
      icon: FlaskConical,
      title: "Science-Backed",
      description: "Every product is developed with proven active ingredients and rigorous testing.",
    },
    {
      icon: Heart,
      title: "Cruelty-Free",
      description: "We never test on animals and are committed to ethical beauty practices.",
    },
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to revolutionize RAJYADU through science-backed formulations, 
            natural ingredients, and sustainable practices that empower everyone to discover their unique glow.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Founded with the belief that beauty should be accessible, effective, and ethical, <span className="inline-flex items-center"></span> 
                has grown from a small startup to a trusted name in the beauty industry. Our journey began with a 
                simple question: "What if we could create products that not only make you look good but feel good too?"
              </p>
              <p>
                Today, we're proud to offer a comprehensive range of skincare, haircare, makeup, and body care 
                products that are carefully formulated with active ingredients, rigorously tested, and loved by 
                millions of customers worldwide.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Beauty lab with scientists developing formulations"
              className="rounded-2xl shadow-lg w-full h-auto"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-amber-50 to-neutral-50 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            To make high-quality, effective RAJYADU products accessible to everyone, 
            while maintaining our commitment to natural ingredients, ethical practices, and 
            scientific innovation. We believe that everyone deserves to feel confident and 
            beautiful in their own skin.
          </p>
        </div>
      </div>
    </div>
  );
}
