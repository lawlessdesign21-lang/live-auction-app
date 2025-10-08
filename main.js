// Import Firebase (ES Modules via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";

// Firebase configuration
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
const bidButton = document.getElementById("bidButton");
const timerDisplay = document.getElementById("timer");

let biddingOpen = false; // Controls whether bids can be placed

// Submit a bid to Firebase
window.submitBid = function () {
  if (!biddingOpen) {
    alert("Bidding has ended.");
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

// Listen for live updates and re-render the list
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

// Admin timer logic
window.startAdminTimer = function () {
  const passwordInput = document.getElementById("adminPassword").value;
  const correctPassword = "fmiadmin2025"; // Change to your desired password

  if (passwordInput !== correctPassword) {
    alert("Incorrect password.");
    return;
  }

  // Start 3-minute timer
  let timeLeft = 180; // seconds
  biddingOpen = true;

  const interval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;

    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(interval);
      timerDisplay.textContent = "Bidding has ended.";
      biddingOpen = false;
      bidButton.disabled = true;
    }
  }, 1000);
};
