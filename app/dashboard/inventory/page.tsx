"use client";

import { PageContainer, Button, Modal, Input } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  CheckCircle,
  Edit,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wrench,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface Asset {
  id: string;
  assetId: string;
  name: string;
  location: string;
  status: "Working" | "Needs Service" | "Broken";
  lastServiced: string;
}

export default function InventoryPage() {
  const [assets, setAssets] = useState<Asset[]>([
    { id: "1", assetId: "FAN-102", name: "Ceiling Fan (USHA)", location: "Room 102", status: "Working", lastServiced: "2026-05-15" },
    { id: "2", assetId: "COOL-03", name: "Water Cooler (BlueStar)", location: "Mess Lobby", status: "Needs Service", lastServiced: "2026-04-10" },
    { id: "3", assetId: "PROJ-501", name: "Projector (Epson)", location: "Seminar Room", status: "Working", lastServiced: "2026-06-01" },
    { id: "4", assetId: "BED-204A", name: "Single Wood Bed Frame", location: "Room 204", status: "Broken", lastServiced: "2025-11-20" },
    { id: "5", assetId: "AC-105", name: "Split Air Conditioner", location: "Room 105", status: "Working", lastServiced: "2026-05-22" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newAssetId, setNewAssetId] = useState("");
  const [newName, setNewName] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [newStatus, setNewStatus] = useState<"Working" | "Needs Service" | "Broken">("Working");

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetId || !newName || !newLoc) return;

    setIsSubmitting(true);
    const newAsset: Asset = {
      id: Math.random().toString(),
      assetId: newAssetId.toUpperCase(),
      name: newName,
      location: newLoc,
      status: newStatus,
      lastServiced: new Date().toISOString().split("T")[0],
    };

    setTimeout(() => {
      setAssets((prev) => [newAsset, ...prev]);
      setShowAddModal(false);
      setNewAssetId("");
      setNewName("");
      setNewLoc("");
      setNewStatus("Working");
      setIsSubmitting(false);
    }, 500);
  };

  const handleToggleStatus = (id: string) => {
    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id !== id) return asset;
        const nextStatus =
          asset.status === "Working"
            ? "Needs Service"
            : asset.status === "Needs Service"
            ? "Broken"
            : "Working";
        return {
          ...asset,
          status: nextStatus,
          lastServiced: new Date().toISOString().split("T")[0],
        };
      })
    );
  };

  const handleDeleteAsset = (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    return asset.status.toLowerCase().replace(" ", "-") === filter && matchesSearch;
  });

  return (
    <PageContainer gradient="from-teal-50 via-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Archive className="h-9 w-9 text-teal-600" />
              Hostel Asset & Inventory
            </h1>
            <p className="text-gray-600">
              Manage physical room assets, furniture, appliances, and maintenance logs directly
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Register Asset
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets by ID, name, or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
            />
          </div>
          <div className="flex gap-2">
            {[
              { val: "all", label: "All Assets" },
              { val: "working", label: "Working" },
              { val: "needs-service", label: "Needs Service" },
              { val: "broken", label: "Broken" },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setFilter(opt.val)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  filter === opt.val
                    ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md"
                    : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Directory */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">Asset ID</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Last Service</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                <AnimatePresence mode="popLayout">
                  {filteredAssets.map((asset) => (
                    <motion.tr
                      key={asset.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-teal-700">{asset.assetId}</td>
                      <td className="py-4 px-6 font-semibold text-gray-800">{asset.name}</td>
                      <td className="py-4 px-6 text-gray-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        {asset.location}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase border ${
                            asset.status === "Working"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : asset.status === "Needs Service"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 font-semibold">{asset.lastServiced}</td>
                      <td className="py-4 px-6 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(asset.id)}
                          title="Rotate Status State"
                          className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filteredAssets.length === 0 && (
            <div className="text-center py-20">
              <Archive className="h-14 w-14 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-semibold">No assets found matching the filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Register Hostel Asset"
        >
          <form onSubmit={handleAddAsset} className="space-y-4">
            <Input
              label="Asset Code / ID"
              placeholder="e.g. FAN-302, COOLER-02"
              value={newAssetId}
              onChange={(e) => setNewAssetId(e.target.value)}
              required
            />
            <Input
              label="Asset Name"
              placeholder="e.g. Ceiling Fan 48-inch"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <Input
              label="Room / Location"
              placeholder="e.g. Room 204 or Common Hall"
              value={newLoc}
              onChange={(e) => setNewLoc(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Working">Working</option>
                <option value="Needs Service">Needs Service</option>
                <option value="Broken">Broken</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t mt-6">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Asset"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
}
