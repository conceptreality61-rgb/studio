import OrderTracker from "@/components/order-tracker";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
        <CardDescription>Tracking information for booking #{params.id}.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div>
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Service:</span> <span className="font-medium">Gardening</span></div>
                <div className="flex justify-between"><span>Date:</span> <span className="font-medium">2023-06-24</span></div>
                <div className="flex justify-between"><span>Time:</span> <span className="font-medium">11:00 AM</span></div>
                <div className="flex justify-between"><span>Worker:</span> <span className="font-medium">Jane Smith</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base"><strong>Total:</strong> <strong className="text-primary">$90.00</strong></div>
            </div>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Live Status</h3>
          <OrderTracker />
        </div>
      </CardContent>
    </Card>
  );
}
