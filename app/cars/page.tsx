import { redirect } from "next/navigation";

export default function CarsPage() {
  redirect("/shop?vehicleType=CAR");
}
