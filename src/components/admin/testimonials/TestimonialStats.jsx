"use client";

import { motion } from "framer-motion";
import { Star, Clock, CheckCircle, XCircle } from "lucide-react";

const AnimatedCounter = ({ value, duration = 0.8 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration }}
      className="text-3xl font-bold text-white"
    >
      {value}
    </motion.div>
  );
};

export default function TestimonialStats({ testimonials = [] }) {
  const total = testimonials.length;
  const pending = testimonials.filter(
    (item) => item.status === "pending",
  ).length;
  const approved = testimonials.filter(
    (item) => item.status === "approved",
  ).length;
  const rejected = testimonials.filter(
    (item) => item.status === "rejected",
  ).length;

  const stats = [
    {
      title: "Total Reviews",
      value: total,
      icon: Star,
      bgGradient: "from-amber-500/20 to-orange-500/10",
      borderColor: "border-amber-500/20",
      iconColor: "text-amber-400",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock,
      bgGradient: "from-yellow-500/20 to-yellow-500/10",
      borderColor: "border-yellow-500/20",
      iconColor: "text-yellow-400",
    },
    {
      title: "Approved",
      value: approved,
      icon: CheckCircle,
      bgGradient: "from-green-500/20 to-emerald-500/10",
      borderColor: "border-green-500/20",
      iconColor: "text-green-400",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: XCircle,
      bgGradient: "from-red-500/20 to-rose-500/10",
      borderColor: "border-red-500/20",
      iconColor: "text-red-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 max-w-4xl">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{
              y: -4,
              boxShadow: "0 20px 50px rgba(245, 166, 35, 0.1)",
            }}
            className={`group relative overflow-hidden rounded-3xl border ${stat.borderColor} bg-gradient-to-br ${stat.bgGradient} p-4 backdrop-blur-xl transition-all duration-300 hover:border-[#F5A623]/40`}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F5A623]/10 via-transparent to-transparent blur-xl" />
            </div>

            <div className="relative z-10 flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <p className="text-sm font-medium uppercase tracking-wider text-zinc-400">
                  {stat.title}
                </p>

                <AnimatedCounter value={stat.value} duration={0.8} />
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon
                  size={20}
                  className={`${stat.iconColor} transition-all duration-300`}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
