import { MessageCircle, Phone, Wallet } from "lucide-react";
import { motion } from "motion/react";
import AppHeader from "../components/AppHeader";
import { useWalletBalance } from "../hooks/useQueries";

export default function AddMoneyPage() {
  const { data: balance } = useWalletBalance();

  return (
    <div data-ocid="addmoney.page">
      <AppHeader />
      <div className="px-4 py-6 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={20} />
            <span className="font-semibold text-sm">আপনার ব্যালেন্স</span>
          </div>
          <p className="text-4xl font-black">৳ {balance?.toString() ?? "0"}</p>
          <p className="text-orange-100 text-sm mt-1">টাকা</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <h2 className="font-bold text-gray-800 text-base mb-3">
            💰 টাকা যোগ করুন
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            আপনার একাউন্টে টাকা যোগ করতে নিচের যোগাযোগ মাধ্যমে আমাদের সাথে যোগাযোগ করুন।
            বিকাশ/নগদ/রকেট এর মাধ্যমে পেমেন্ট করুন।
          </p>
          <div className="space-y-3">
            <a
              data-ocid="addmoney.whatsapp.button"
              href="https://wa.me/8801XXXXXXXXX?text=টাকা%20যোগ%20করতে%20চাই"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 hover:bg-green-100 transition-colors"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-800 text-sm">
                  WhatsApp এ যোগাযোগ করুন
                </p>
                <p className="text-green-600 text-xs">+880 1X XXXX XXXX</p>
              </div>
            </a>
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Phone size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-800 text-sm">ফোন করুন</p>
                <p className="text-blue-600 text-xs">+880 1X XXXX XXXX</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-orange-50 rounded-xl p-4 border border-orange-100"
        >
          <h3 className="font-semibold text-orange-800 text-sm mb-2">
            📌 নির্দেশাবলী
          </h3>
          <ul className="text-xs text-orange-700 space-y-1 list-disc list-inside">
            <li>বিকাশ/নগদ/রকেটে পেমেন্ট করুন</li>
            <li>Transaction ID সহ WhatsApp এ জানান</li>
            <li>২৪ ঘণ্টার মধ্যে ব্যালেন্স যোগ হবে</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
