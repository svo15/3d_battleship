"use client"
import Scene from "./components/Scene";

export default function Home() {


  return (
    <main className="w-full h-screen flex items-center justify-center  ">
      <div className="flex items-center justify-center w-[80vw] h-[90vh] bg-white rounded-2xl">
        <Scene/>
      </div>
    </main>
  );
}
