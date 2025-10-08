// Import Firebase (ES Modules via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBqrEiSUKLSCjApJ2dnSH63hmwV95tcfAM",
  authDomain: "live-auctions-d9008.firebaseapp.com",
  projectId: "live-auctions-d9008",
  storageBucket: "live-auctions-d9008.firebasestorage.app",
  messagingSenderId: "68267344631",
  appId: "1:68267344631:web:6db9fc052098a6e3b5c9f2",
  measurementId: "G-M13FSTDZDM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// DOM references
const userIdInput = document.getElementById("userId");
const amountInput = document.getElementById("amount");
const auctionList = document.getElementById("auctionList");

// Submit a bid to Firebase
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

// Reset auction after password check
window.resetAuction = function () {
  const password = prompt("Enter admin password to reset auction:");
  if (password !== "admin123") {
    alert("Incorrect password. Reset cancelled.");
    return;
  }

  const bidsRef = ref(db, 'bids');
  remove(bidsRef)
    .then(() => {
      auctionList.innerHTML = "";
      alert("Auction has been reset.");
    })
    .catch((error) => {
      console.error("Reset failed:", error);
      alert("Failed to reset auction.");
    });
};

// Listen for live updates and re-render the list
const bidsRef = ref(db, 'bids');
onValue(bidsRef, (snapshot) => {
  const data = snapshot.val();
  renderAuction(data);
});

// Render auction leaderboard
function renderAuction(bids) {
  auctionList.innerHTML = "";
  if (!bids) return;

  const sortedBids = Object.entries(bids)
    .sort((a, b) => b[1] - a[1])
    .reverse();

  sortedBids.forEach(([userId, amount]) => {
    const entry = document.createElement("div");
    entry.className = "user-entry";
    entry.innerHTML = `<strong>User ${userId}</strong> <span>$${amount.toFixed(2)}</span>`;
    auctionList.appendChild(entry);
  });
}
