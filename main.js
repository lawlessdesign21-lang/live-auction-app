<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Live Auction</title>
  <style>
    .user-entry {
      margin: 5px 0;
    }
    #auctionStatusMsg {
      font-weight: bold;
      color: red;
    }
  </style>
</head>
<body>

  <!-- ✅ Added Navigation and Auction Control Buttons -->
  <button onclick="window.location.href='https://www.fmistemfoundation.org/auction-fmi-need'">
    Return to Auction Page
  </button>

  <input type="password" id="adminPasswordToggle" placeholder="Enter admin password">
  <button onclick="toggleAuction()">Stop/Start Auction</button>

  <p id="auctionStatusMsg"></p>

  <!-- Auction Inputs -->
  <input type="text" id="userId" placeholder="User ID">
  <input type="number" id="amount" placeholder="Bid Amount">
  <button onclick="submitBid()">Submit Bid</button>

  <!-- Leaderboard -->
  <div id="auctionList"></div>

  <!-- Reset Admin Control -->
  <input type="password" id="resetPassword" placeholder="Admin Password">
  <button onclick="resetAuction()">Reset Auction</button>

  <!-- Firebase and JS -->
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
    import { getDatabase, ref, set, onValue, remove, get, child } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";

    const firebaseConfig = {
      apiKey: "AIzaSyBqrEiSUKLSCjApJ2dnSH63hmwV95tcfAM",
      authDomain: "live-auctions-d9008.firebaseapp.com",
      projectId: "live-auctions-d9008",
      storageBucket: "live-auctions-d9008.firebasestorage.app",
      messagingSenderId: "68267344631",
      appId: "1:68267344631:web:6db9fc052098a6e3b5c9f2",
      measurementId: "G-M13FSTDZDM"
    };

    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const db = getDatabase(app);

    const userIdInput = document.getElementById("userId");
    const amountInput = document.getElementById("amount");
    const auctionList = document.getElementById("auctionList");
    const passwordInput = document.getElementById("resetPassword");
    const adminPasswordToggle = document.getElementById("adminPasswordToggle");
    const statusMsg = document.getElementById("auctionStatusMsg");

    // 🔄 Listen for Auction Status Changes
    const statusRef = ref(db, 'auctionStatus');
    let auctionStopped = false;

    onValue(statusRef, (snapshot) => {
      auctionStopped = snapshot.val() === "stopped";
      statusMsg.textContent = auctionStopped ? "⛔ Auction is currently STOPPED" : "";
    });

    // 🧠 Toggle Auction Stop/Start
    window.toggleAuction = function () {
      const password = adminPasswordToggle.value.trim();
      if (password !== "admin123") {
        alert("❌ Incorrect password.");
        return;
      }

      const newStatus = auctionStopped ? "active" : "stopped";
      set(statusRef, newStatus)
        .then(() => {
          alert(`✅ Auction is now ${newStatus.toUpperCase()}`);
          adminPasswordToggle.value = "";
        })
        .catch((err) => {
          alert("⚠️ Failed to update auction status.");
          console.error(err);
        });
    };

    // 🧾 Submit Bid (if Auction is Active)
    window.submitBid = function () {
      if (auctionStopped) {
        alert("⛔ Auction is currently stopped. No bids allowed.");
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

    // 🖥️ Render Leaderboard
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

    // 🔄 Live Bid Updates
    const bidsRef = ref(db, 'bids');
    onValue(bidsRef, (snapshot) => {
      const data = snapshot.val();
      renderAuction(data);
    });

    // 🔐 Reset Auction (Admin Only)
    window.resetAuction = function () {
      const password = passwordInput.value.trim();
      const correctPassword = "admin123";

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
  </script>
</body>
</html>
