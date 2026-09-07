"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift } from "lucide-react";

import RewardStats from "@/components/admin/rewards/RewardStats";
import RewardFilters from "@/components/admin/rewards/RewardFilters";
import RewardTable from "@/components/admin/rewards/RewardTable";
import RewardDetailsModal from "@/components/admin/rewards/RewardDetailsModal";
import RewardSkeleton from "@/components/admin/rewards/RewardSkeleton";
import RewardPagination from "@/components/admin/rewards/RewardPagination";
import RewardEmptyState from "@/components/admin/rewards/RewardEmptyState";

const ITEMS_PER_PAGE = 10;

export default function RewardsPage() {
  const [loading, setLoading] = useState(true);

  const [rewards, setRewards] = useState([]);

  const [statistics, setStatistics] = useState({
    totalRewards: 0,
    activeRewards: 0,
    appliedRewards: 0,
    usedRewards: 0,
    expiredRewards: 0,
    totalRewardValue: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedReward, setSelectedReward] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    loadRewards();
  }, []);

  async function loadRewards() {
    try {
      setLoading(true);

      const response = await fetch("/api/rewards");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load rewards.");
      }

      setRewards(data.rewards || []);

      setStatistics(
        data.statistics || {
          totalRewards: 0,
          activeRewards: 0,
          appliedRewards: 0,
          usedRewards: 0,
          expiredRewards: 0,
        },
      );
    } catch (error) {
      console.error("[Rewards]", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredRewards = useMemo(() => {
    return rewards.filter((reward) => {
      const keyword = search.toLowerCase().trim();

      const matchesSearch =
        reward.rewardId?.toLowerCase().includes(keyword) ||
        reward.customerName?.toLowerCase().includes(keyword) ||
        reward.customerId?.toLowerCase().includes(keyword) ||
        reward.contactNumber?.toLowerCase().includes(keyword) ||
        reward.rentalRequestId?.toLowerCase().includes(keyword);

      const matchesStatus = status === "All" || reward.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [rewards, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRewards.length / ITEMS_PER_PAGE),
  );

  const paginatedRewards = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredRewards.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRewards, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  function handleView(reward) {
    setSelectedReward(reward);
    setOpenModal(true);
  }

  function handleCloseModal() {
    setOpenModal(false);
    setSelectedReward(null);
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5A623]/10 sm:h-16 sm:w-16">
            <Gift size={26} className="text-[#F5A623]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Reward Points
            </h1>

            <p className="mt-1 text-sm text-zinc-500 sm:text-base">
              Manage customer rewards and discounts.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}

      <RewardStats
        stats={{
          total: statistics.totalRewards,
          active: statistics.activeRewards,
          applied: statistics.appliedRewards,
          used: statistics.usedRewards,
          expired: statistics.expiredRewards,
          totalValue: statistics.totalRewardValue,
        }}
      />

      {/* Filters */}

      <RewardFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        total={filteredRewards.length}
        onRefresh={loadRewards}
      />

      {/* Content */}

      {loading ? (
        <RewardSkeleton rows={10} />
      ) : filteredRewards.length === 0 ? (
        <RewardEmptyState />
      ) : (
        <>
          <RewardTable rewards={paginatedRewards} onView={handleView} />

          <RewardPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Details Modal */}

      <RewardDetailsModal
        open={openModal}
        reward={selectedReward}
        onClose={handleCloseModal}
      />
    </div>
  );
}
