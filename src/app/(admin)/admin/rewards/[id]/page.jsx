"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

import RewardCard from "@/components/admin/rewards/RewardCard";
import RewardTimeline from "@/components/admin/rewards/RewardTimeline";
import RewardDetailsModal from "@/components/admin/rewards/RewardDetailsModal";
import CustomerRewardHistory from "@/components/admin/customers/CustomerRewardHistory";

export default function RewardDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const rewardId = params.id;

  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadReward();
  }, []);

  async function loadReward() {
    try {
      setLoading(true);

      const response = await fetch(`/api/rewards/${rewardId}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load reward.");
      }

      setReward(data.reward);
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#F5A623]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <AlertCircle size={55} className="text-red-500" />

        <h2 className="text-2xl font-bold text-white">{error}</h2>

        <button
          onClick={() => router.back()}
          className="rounded-xl bg-[#F5A623] px-6 py-3 font-semibold text-black"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!reward) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-5 flex items-center gap-2 text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <h1 className="text-4xl font-bold text-white">Reward Details</h1>

          <p className="mt-2 text-zinc-500">Reward ID : {reward.rewardId}</p>
        </div>

        <button
          onClick={() => setShowDetails(true)}
          className="rounded-2xl bg-[#F5A623] px-6 py-3 font-semibold text-black transition hover:scale-105"
        >
          View Details
        </button>
      </div>

      {/* Summary Card */}

      <RewardCard reward={reward} />

      {/* Timeline */}

      <RewardTimeline reward={reward} />

      {/* History */}

      <CustomerRewardHistory rewards={history} />

      {/* Details Modal */}

      <RewardDetailsModal
        open={showDetails}
        reward={reward}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
}
