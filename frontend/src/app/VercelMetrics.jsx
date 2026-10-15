import { useEffect } from "react";
 import { SpeedInsights } from "@vercel/speed-insights/react";
 
 const scheduleIdle = (callback) => {
   if ("requestIdleCallback" in window) {
     return window.requestIdleCallback(callback, { timeout: 3000 });
   }
   return window.setTimeout(callback, 1500);
 };
 
 const cancelIdle = (id) => {
   if ("cancelIdleCallback" in window) {
     window.cancelIdleCallback(id);
     return;
   }
   window.clearTimeout(id);
 };
 
 export default function VercelMetrics() {
   useEffect(() => {
     const idleId = scheduleIdle(() => {
      import("@vercel/analytics").then(({ inject }) => inject()).catch(() => {
         // Metrics are non-critical and should never affect app rendering.
       });
     });
 
     return () => cancelIdle(idleId);
   }, []);
 
   return <SpeedInsights />;
 }
