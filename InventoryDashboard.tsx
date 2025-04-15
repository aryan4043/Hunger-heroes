import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertCircle, 
  AlertTriangle, 
  ArrowDownUp, 
  ArrowUpDown, 
  Box, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ListFilter, 
  Loader2, 
  Package,
  PackageOpen, 
  PanelLeftOpen, 
  RotateCcw, 
  Search, 
  SlidersHorizontal 
} from 'lucide-react';
import { CategoryIcon } from "@/components/inventory/CategoryIcon";
import { format, isAfter, isBefore, addDays } from 'date-fns';

// Sample inventory data for initial development
// This will be replaced by actual API calls
const sampleInventoryItems = [
  {
    id: 1,
    foodName: "Rice",
    category: { id: 1, name: "Grains", type: "non_perishable" },
    quantity: 100,
    unit: "kg",
    entryDate: new Date(2023, 3, 15),
    expiryDate: new Date(2024, 3, 15),
    status: "available",
    storageLocation: "Shelf A1",
  },
  {
    id: 2,
    foodName: "Canned Beans",
    category: { id: 1, name: "Canned Goods", type: "non_perishable" },
    quantity: 50,
    unit: "cans",
    entryDate: new Date(2023, 4, 10),
    expiryDate: new Date(2025, 4, 10),
    status: "available",
    storageLocation: "Shelf B2",
  },
  {
    id: 3,
    foodName: "Apples",
    category: { id: 2, name: "Fruits", type: "perishable" },
    quantity: 25,
    unit: "kg",
    entryDate: new Date(2023, 5, 1),
    expiryDate: new Date(2023, 5, 8),
    status: "expiring_soon",
    storageLocation: "Refrigerator 1",
  },
  {
    id: 4,
    foodName: "Milk",
    category: { id: 3, name: "Dairy", type: "perishable" },
    quantity: 20,
    unit: "liters",
    entryDate: new Date(2023, 5, 3),
    expiryDate: new Date(2023, 5, 10),
    status: "expiring_soon",
    storageLocation: "Refrigerator 2",
  },
  {
    id: 5,
    foodName: "Pasta",
    category: { id: 1, name: "Grains", type: "non_perishable" },
    quantity: 75,
    unit: "kg",
    entryDate: new Date(2023, 2, 20),
    expiryDate: new Date(2024, 2, 20),
    status: "available",
    storageLocation: "Shelf A2",
  },
];

// Sample categories
const sampleCategories = [
  { id: 1, name: "Grains", type: "non_perishable" },
  { id: 2, name: "Fruits", type: "perishable" },
  { id: 3, name: "Dairy", type: "perishable" },
  { id: 4, name: "Vegetables", type: "perishable" },
  { id: 5, name: "Canned Goods", type: "non_perishable" },
  { id: 6, name: "Baked Goods", type: "perishable" },
];

// Sample alerts
const sampleAlerts = [
  {
    id: 1,
    type: "expiry",
    severity: "high",
    message: "Apples are expiring in 3 days",
    itemId: 3,
    created: new Date(2023, 5, 5),
    isRead: false,
    isResolved: false,
  },
  {
    id: 2,
    type: "expiry",
    severity: "high",
    message: "Milk is expiring in 2 days",
    itemId: 4,
    created: new Date(2023, 5, 3),
    isRead: true,
    isResolved: false,
  },
  {
    id: 3,
    type: "low_stock",
    severity: "medium",
    message: "Rice is running low (25% remaining)",
    itemId: 1,
    created: new Date(2023, 5, 2),
    isRead: false,
    isResolved: false,
  },
];

// Helper function to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'expiring_soon':
      return 'bg-yellow-100 text-yellow-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'reserved':
      return 'bg-blue-100 text-blue-800';
    case 'distributed':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get category icon
const getCategoryIcon = (type: string) => {
  return <CategoryIcon type={type} className="h-4 w-4 mr-1" />;
};

// Helper function to get alert severity icon
const getAlertSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'high':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case 'medium':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'low':
      return <AlertCircle className="h-5 w-5 text-blue-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

// Helper function to format expiry date
const formatExpiryDate = (date: Date) => {
  const now = new Date();
  const daysUntilExpiry = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    return 'Expired';
  } else if (daysUntilExpiry === 0) {
    return 'Expires today';
  } else if (daysUntilExpiry === 1) {
    return 'Expires tomorrow';
  } else if (daysUntilExpiry < 7) {
    return `Expires in ${daysUntilExpiry} days`;
  } else {
    return `Expires on ${format(date, 'MMM d, yyyy')}`;
  }
};

// Main component for inventory dashboard
export default function InventoryDashboard() {
  const [selectedTab, setSelectedTab] = useState('stock');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // TODO: Replace with real API calls
  const { data: inventoryItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['/api/inventory/items'],
    queryFn: () => Promise.resolve(sampleInventoryItems),
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/inventory/categories'],
    queryFn: () => Promise.resolve(sampleCategories),
  });
  
  const { data: alerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['/api/inventory/alerts'],
    queryFn: () => Promise.resolve(sampleAlerts),
  });
  
  // Filter inventory items based on selected filters
  const filteredItems = inventoryItems?.filter(item => {
    // Filter by search term
    if (searchTerm && !item.foodName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (categoryFilter && item.category.id.toString() !== categoryFilter) {
      return false;
    }
    
    // Filter by status
    if (statusFilter && item.status !== statusFilter) {
      return false;
    }
    
    return true;
  });
  
  // Count items by status
  const availableCount = inventoryItems?.filter(item => item.status === 'available').length || 0;
  const expiringCount = inventoryItems?.filter(item => item.status === 'expiring_soon').length || 0;
  const totalItems = inventoryItems?.length || 0;
  
  // Count unresolved alerts
  const unresolvedAlerts = alerts?.filter(alert => !alert.isResolved).length || 0;
  
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col space-y-8">
        {/* Header with title and overview stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground mt-1">
              Track, manage, and optimize your food inventory
            </p>
            <div className="mt-2">
              <a 
                href="/food-safety-guidelines" 
                className="text-sm text-primary flex items-center hover:underline"
                target="_self"
              >
                <AlertCircle className="mr-1 h-4 w-4"/> FSSAI Food Safety Guidelines
              </a>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button>
              <PackageOpen className="mr-2 h-4 w-4" />
              Add Inventory Item
            </Button>
            <Button variant="outline">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Manage Categories
            </Button>
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Inventory</p>
                  <h3 className="text-2xl font-bold mt-1">{totalItems} items</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Box className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available</p>
                  <h3 className="text-2xl font-bold mt-1">{availableCount} items</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                  <h3 className="text-2xl font-bold mt-1">{expiringCount} items</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                  <h3 className="text-2xl font-bold mt-1">{unresolvedAlerts} unresolved</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content tabs */}
        <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-3 md:w-auto md:grid-cols-4">
            <TabsTrigger value="stock">Inventory</TabsTrigger>
            <TabsTrigger value="expiry">Expiry Management</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          
          {/* Inventory tab content */}
          <TabsContent value="stock" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <CardTitle>Current Inventory</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type="search"
                          placeholder="Search inventory..."
                          className="pl-8 w-full md:w-[240px]"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={categoryFilter || ""} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                          {categories?.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={statusFilter || ""} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Statuses</SelectItem>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="distributed">Distributed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button variant="outline" size="icon" onClick={() => {
                        setSearchTerm('');
                        setCategoryFilter(null);
                        setStatusFilter(null);
                      }}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingItems ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                ) : filteredItems?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <PackageOpen className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">No inventory items found</p>
                    <p className="text-sm">Try adjusting your filters or add new items</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Item</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead>Storage Location</TableHead>
                          <TableHead>Entry Date</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.foodName}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getCategoryIcon(item.category.type)}
                                {item.category.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                            <TableCell>{item.storageLocation}</TableCell>
                            <TableCell>{format(item.entryDate, 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                              <div className={`flex items-center ${
                                isBefore(item.expiryDate, addDays(new Date(), 7)) 
                                  ? 'text-yellow-600' 
                                  : 'text-gray-600'
                              }`}>
                                {formatExpiryDate(item.expiryDate)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Expiry management tab content */}
          <TabsContent value="expiry" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Expiry Management</CardTitle>
                <CardDescription>
                  Monitor and manage items approaching their expiry date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Expiring today */}
                  <Card>
                    <CardHeader className="bg-red-50 pb-3">
                      <CardTitle className="text-lg flex items-center text-red-800">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Expiring Today
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {/* Items that expire today would be listed here */}
                      <div className="text-center py-6 text-gray-500">
                        <p>No items expiring today</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Expiring this week */}
                  <Card>
                    <CardHeader className="bg-yellow-50 pb-3">
                      <CardTitle className="text-lg flex items-center text-yellow-800">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Expiring This Week
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {inventoryItems
                          ?.filter(item => 
                            isBefore(item.expiryDate, addDays(new Date(), 7)) &&
                            isAfter(item.expiryDate, new Date())
                          )
                          .map(item => (
                            <div key={item.id} className="p-4 hover:bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{item.foodName}</h4>
                                  <p className="text-sm text-gray-500">{item.quantity} {item.unit}</p>
                                </div>
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  {formatExpiryDate(item.expiryDate)}
                                </Badge>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline" className="text-xs">Mark Used</Button>
                                <Button size="sm" variant="outline" className="text-xs">Distribute</Button>
                              </div>
                            </div>
                          ))}
                        {inventoryItems?.filter(item => 
                          isBefore(item.expiryDate, addDays(new Date(), 7)) &&
                          isAfter(item.expiryDate, new Date())
                        ).length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <p>No items expiring this week</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Expiring this month */}
                  <Card>
                    <CardHeader className="bg-blue-50 pb-3">
                      <CardTitle className="text-lg flex items-center text-blue-800">
                        <Calendar className="h-5 w-5 mr-2" />
                        Expiring This Month
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {inventoryItems
                          ?.filter(item => 
                            isBefore(item.expiryDate, addDays(new Date(), 30)) &&
                            isAfter(item.expiryDate, addDays(new Date(), 7))
                          )
                          .map(item => (
                            <div key={item.id} className="p-4 hover:bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{item.foodName}</h4>
                                  <p className="text-sm text-gray-500">{item.quantity} {item.unit}</p>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800">
                                  {formatExpiryDate(item.expiryDate)}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        {inventoryItems?.filter(item => 
                          isBefore(item.expiryDate, addDays(new Date(), 30)) &&
                          isAfter(item.expiryDate, addDays(new Date(), 7))
                        ).length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <p>No items expiring this month</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Distribution tab content */}
          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribution Planning</CardTitle>
                <CardDescription>
                  Plan and manage food distributions to partner organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <PackageOpen className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">No active distributions</p>
                  <p className="text-sm mb-6">Create a distribution plan to start allocating inventory items</p>
                  <Button>Create Distribution Plan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Alerts tab content */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Alerts</CardTitle>
                <CardDescription>
                  Review and manage alerts about your inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAlerts ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                ) : alerts?.filter(alert => !alert.isResolved).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">All alerts resolved</p>
                    <p className="text-sm">There are no pending alerts to address</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {alerts
                      ?.filter(alert => !alert.isResolved)
                      .map(alert => (
                        <div key={alert.id} className={`p-4 flex items-start gap-4 ${
                          alert.isRead ? 'bg-white' : 'bg-gray-50'
                        }`}>
                          {getAlertSeverityIcon(alert.severity)}
                          <div className="flex-1">
                            <h4 className={`font-medium ${!alert.isRead ? 'font-semibold' : ''}`}>
                              {alert.message}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {format(alert.created, 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">View</Button>
                            <Button size="sm">Resolve</Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}