import { redirect } from "next/navigation";

export default function BikesPage() {
  redirect("/shop?vehicleType=BIKE");
}
