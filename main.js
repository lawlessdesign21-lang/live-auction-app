// Import Firebase (ES Modules via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqrEiSUKLSCjApJ2dnSH63hmwV95tcfAM",
  authDomain: "live-auctions-d9008.firebaseapp.com",
  projectId: "live-auctions-d9008",
  storageBucket: "live-auctions-d9008.appspot.com",
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

// Auction status tracking
const auctionStatusRef = ref(db, 'auctionStatus');
let isAuctionRunning = true;

// Listen for auction status updates
onValue(auctionStatusRef, (snapshot) => {
  const status = snapshot.val();
  isAuctionRunning = status !== "stopped";
});

// Submit a bid to Firebase
window.submitBid = function () {
  if (!isAuctionRunning) {
    alert("Auction is currently stopped. Bids cannot be placed.");
    return;
  }

  const userId = userIdInput.value.trim();
  const amount = parseFloat(amountInput.value.trim());

  if (!userId || isNaN(amount) || amount < 0) {
    alert("Please enter a valid user number and bid amount.");
    return;
  }

  const bidRef = ref(db, 'bids/' + userId);
  set(bidRef, amount);
};

// Toggle the auction status (admin only)
window.toggleAuction = function () {
  const passwordInput = document.getElementById("adminPassword");
  const password = passwordInput.value.trim();

  if (password !== "admin123") {
    alert("Incorrect admin password.");
    return;
  }

  const newStatus = isAuctionRunning ? "stopped" : "running";
  set(auctionStatusRef, newStatus).then(() => {
    alert(`Auction has been ${newStatus === "stopped" ? "stopped" : "resumed"}.`);
    passwordInput.value = ""; // Clear password input
  });
};

// Listen for live bid updates and re-render leaderboard
const bidsRef = ref(db, 'bids');
onValue(bidsRef, (snapshot) => {
  const data = snapshot.val();
  renderAuction(data);
});

// Render the auction leaderboard
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
