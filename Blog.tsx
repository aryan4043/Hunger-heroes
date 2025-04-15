import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface BlogProps {
  isUserLoggedIn: boolean;
  userType: string | null;
  onLogout: () => void;
}

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: "Reducing Food Waste: A Guide for Restaurants",
    excerpt: "Learn effective strategies for minimizing food waste in your restaurant business while making a positive impact in your community.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    author: "Priya Sharma",
    date: new Date("2023-11-15"),
    category: "Business"
  },
  {
    id: 2,
    title: "The Environmental Impact of Food Waste",
    excerpt: "Explore how food waste contributes to climate change and what we can do collectively to reduce our carbon footprint through better food management.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    author: "Dr. Rajeev Kumar",
    date: new Date("2023-10-28"),
    category: "Environment"
  },
  {
    id: 3,
    title: "Success Stories: How FoodShare Is Making a Difference",
    excerpt: "Read about the inspiring journeys of donors and recipients on our platform and how FoodShare is helping bridge the gap between food surplus and scarcity.",
    image: "https://images.unsplash.com/photo-1593113598332-cd59a93c5156?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    author: "Aishwarya Patel",
    date: new Date("2023-10-12"),
    category: "Success Stories"
  },
  {
    id: 4,
    title: "Best Practices for Food Banks: Maximizing Donations",
    excerpt: "Practical tips for food banks and charitable organizations to efficiently manage donations and serve more people in need.",
    image: "https://images.unsplash.com/photo-1615648078154-a03c25b8ba9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    author: "Vikram Singh",
    date: new Date("2023-09-30"),
    category: "Best Practices"
  },
  {
    id: 5,
    title: "Food Safety Guidelines for Donation: What You Need to Know",
    excerpt: "Essential information about food safety standards when donating or receiving food to ensure health and safety for all parties involved.",
    image: "https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    author: "Dr. Meera Reddy",
    date: new Date("2023-09-20"),
    category: "Food Safety"
  },
  {
    id: 6,
    title: "The Role of Technology in Reducing Food Waste",
    excerpt: "How innovative technology solutions like FoodShare are revolutionizing food redistribution and waste reduction efforts.",
    image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    author: "Arjun Mehta",
    date: new Date("2023-09-05"),
    category: "Technology"
  }
];

export default function Blog({ isUserLoggedIn, userType, onLogout }: BlogProps) {
  return (
    <PageLayout 
      title="Blog" 
      description="Insights, success stories, and best practices from our food donation community"
      isUserLoggedIn={isUserLoggedIn}
      userType={userType}
      onLogout={onLogout}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {blogPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden flex flex-col">
            <div className="h-48 overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
              />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {post.category}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(post.date)}
                </span>
              </div>
              <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
              <CardDescription className="text-xs text-gray-500">
                By {post.author}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-3">
                {post.excerpt}
              </p>
            </CardContent>
            <CardFooter className="pt-0 mt-auto">
              <Button variant="outline" className="w-full">
                Read More
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="flex justify-center mt-10">
        <Button>Load More Articles</Button>
      </div>
    </PageLayout>
  );
}