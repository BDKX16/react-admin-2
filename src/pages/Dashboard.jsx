import React from "react";
import Chart from "@/components/chart";

const Dashboard = () => {
  return (
    <div>
      <div className="flex flex-1 flex-row gap-4 max-h-[200px]">
        <div className="aspect-ratio-pill flex-1  rounded-xl bg-muted/50" />
        <div className="aspect-ratio-pill flex-1  rounded-xl bg-muted/50" />
        <div className="aspect-ratio-pill flex-1 rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
        Hola
      </div>
    </div>
  );
};

export default Dashboard;
