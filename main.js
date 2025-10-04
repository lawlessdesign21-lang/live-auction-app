// Import Firebase (ES Modules via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";

// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqrEiSUKLSCjApJ2dnSH63hmwV95tcfAM",
  authDomain: "live-auctions-d9008.firebaseapp.com",
  projectId: "live-auctions-d9008",
  storageBucket: "live-auctions-d9008.firebasestorage.app",
  messagingSenderId: "68267344631",
  appId: "1:68267344631:web:6db9fc052098a6e3b5c9f2",
  measurementId: "G-M13FSTDZDM"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// Get DOM elements
const userIdInput = document.getElementById("userId");
const amountInput = document.getElementById("amount");
const auctionList = document.getElementById("auctionList");
const passwordInput = document.getElementById("resetPassword");

// 🔼 Submit a Bid
window.submitBid = function () {
  const userId = userIdInput.value.trim();
  const amount = parseFloat(amountInput.value.trim());

  if (!userId || isNaN(amount) || amount < 0) {
    alert("Please enter a valid user number and bid amount.");
    return;
  }

  const bidRef = ref(db, 'bids/' + userId);
  set(bidRef, amount);
};

// 🔄 Live Listener for Bid Updates
const bidsRef = ref(db, 'bids');
onValue(bidsRef, (snapshot) => {
  const data = snapshot.val();
  renderAuction(data);
});

// 🖥️ Render the Auction Leaderboard
function renderAuction(bids) {
  auctionList.innerHTML = "";

  if (!bids) return;

  const sortedBids = Object.entries(bids)
    .sort((a, b) => b[1] - a[1]);

  sortedBids.forEach(([userId, amount]) => {
    const entry = document.createElement("div");
    entry.className = "user-entry";
    entry.innerHTML = `<strong>User ${userId}</strong> <span>$${amount.toFixed(2)}</span>`;
    auctionList.appendChild(entry);
  });
}

// 🔐 Reset the Auction (Admin Only)
window.resetAuction = function () {
  const password = passwordInput.value.trim();
  const correctPassword = "admin123"; // ✅ Change this to your actual password

  if (password !== correctPassword) {
    alert("❌ Incorrect password. Reset denied.");
    return;
  }

  const bidsRef = ref(db, 'bids/');
  remove(bidsRef)
    .then(() => {
      alert("✅ Auction has been reset.");
      passwordInput.value = "";
    })
    .catch((error) => {
      console.error("Reset error:", error);
      alert("⚠️ Failed to reset auction.");
    });
};
