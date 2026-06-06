"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Camera,
  CheckCircle,
  Loader2,
  Search,
  Upload,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";
import Image from "next/image";

import { useEffect, useRef, useState } from "react";

// Modal component for adding a student
function AddStudentModal({
  open,
  onClose,
  onStudentAdded,
}: {
  open: boolean;
  onClose: () => void;
  onStudentAdded: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, roll_no: rollNo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add student.");
        setIsSubmitting(false);
        return;
      }
      setFullName("");
      setEmail("");
      setRollNo("");
      onStudentAdded();
      onClose();
    } catch {
      setError("Failed to add student.");
      setIsSubmitting(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">Add Student</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Roll No</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Student"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface Student {
  id: string;
  full_name: string;
  roll_no: string | null;
  email: string;
  photo_url: string | null;
  created_at: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  // ...existing code...
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null,
  );

  // Photo upload state
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [previewFor, setPreviewFor] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageB64, setImageB64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/students");
      const data = (await res.json()) as {
        students?: Student[];
        error?: string;
      };
      setStudents(data.students ?? []);
    } catch {
      setMessage({ text: "Failed to load students.", ok: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll_no ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleFileChange = (
    studentId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPreviewFor(studentId);
      setPreviewUrl(result);
      setImageB64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRegisterFace = async (studentId: string) => {
    if (!imageB64) return;
    setUploadingFor(studentId);
    setMessage(null);
    try {
      const res = await fetch(`/api/faces/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64: imageB64 }),
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
        warning?: string;
      };
      if (!res.ok) {
        setMessage({ text: data.error ?? "Upload failed.", ok: false });
        return;
      }
      setMessage({
        text: data.warning
          ? `Photo saved. ${data.warning}`
          : (data.message ?? "Face registered successfully!"),
        ok: true,
      });
      await loadStudents();
      setPreviewFor(null);
      setPreviewUrl(null);
      setImageB64(null);
    } catch {
      setMessage({ text: "Upload failed.", ok: false });
    } finally {
      setUploadingFor(null);
    }
  };

  const cancelUpload = () => {
    setPreviewFor(null);
    setPreviewUrl(null);
    setImageB64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const stats = {
    total: students.length,
    withPhoto: students.filter((s) => !!s.photo_url).length,
    withoutPhoto: students.filter((s) => !s.photo_url).length,
  };

  return (
    <div className="p-6">
      {/* Add Student Modal */}
      <AddStudentModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onStudentAdded={loadStudents}
      />

      {/* Add Student Button */}
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
          onClick={() => setAddModalOpen(true)}
        >
          + Add Student
        </button>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Student Management
        </h1>
        <p className="text-gray-600">
          Manage students and register faces for automatic attendance
        </p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
            message.ok
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.ok ? (
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
          ) : (
            <X className="h-4 w-4 flex-shrink-0" />
          )}
          {message.text}
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 shadow-lg text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Students</p>
              <p className="text-4xl font-bold">{stats.total}</p>
            </div>
            <Users className="h-16 w-16 opacity-30" />
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 shadow-lg text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Face Registered</p>
              <p className="text-4xl font-bold">{stats.withPhoto}</p>
            </div>
            <UserCheck className="h-16 w-16 opacity-30" />
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 shadow-lg text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">Not Registered</p>
              <p className="text-4xl font-bold">{stats.withoutPhoto}</p>
            </div>
            <UserX className="h-16 w-16 opacity-30" />
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or roll no…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading students…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Roll No
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Face Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Upload Photo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {student.photo_url ? (
                            <Image
                              src={student.photo_url}
                              alt={student.full_name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            student.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {student.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">
                        {student.roll_no ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(student.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.photo_url ? (
                        <span className="flex items-center gap-1 text-sm text-green-700 font-medium">
                          <CheckCircle className="h-4 w-4" />
                          Registered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-orange-600 font-medium">
                          <Camera className="h-4 w-4" />
                          Not registered
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {previewFor === student.id && previewUrl ? (
                        <div className="flex items-center gap-2">
                          <Image
                            src={previewUrl}
                            alt="preview"
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                          />
                          <button
                            onClick={() => void handleRegisterFace(student.id)}
                            disabled={uploadingFor === student.id}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            {uploadingFor === student.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Upload className="h-3 w-3" />
                            )}
                            Save
                          </button>
                          <button
                            onClick={cancelUpload}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            capture="user"
                            className="hidden"
                            onChange={(e) => handleFileChange(student.id, e)}
                          />
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition border border-blue-200">
                            <Camera className="h-3 w-3" />
                            {student.photo_url ? "Replace Photo" : "Add Photo"}
                          </span>
                        </label>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {isLoading ? "Loading…" : "No students found"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>How facial recognition works:</strong>
        <ol className="list-decimal ml-4 mt-2 space-y-1">
          <li>
            Upload a clear face photo for each student using the button above.
          </li>
          <li>
            The photo is stored in Supabase Storage and registered with the
            DeepFace service.
          </li>
          <li>
            On the Attendance page, start the camera — it automatically
            identifies students every 2.5 s and logs entry/exit.
          </li>
          <li>
            Make sure the DeepFace service is running:{" "}
            <code className="bg-blue-100 px-1 rounded">
              cd deepface-service &amp;&amp; python main.py
            </code>
          </li>
        </ol>
      </div>
    </div>
  );
}
