document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and dropdown
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p><strong>Description:</strong> ${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Available Spots:</strong> ${spotsLeft} of ${details.max_participants}</p>
          <div class="participants">
            <h5>Current Participants:</h5>
            <ul>
              ${details.participants.map(email => `
                <li>
                  <span>${email}</span>
                  <span class="delete-icon" onclick="unregisterParticipant('${name}', '${email}')">✖</span>
                </li>
              `).join('')}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email })
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = "Successfully signed up for the activity!";
        messageDiv.className = "message success";
        signupForm.reset();
        // Reload activities to show updated participants after a short delay
        setTimeout(() => {
          fetchActivities();
        }, 100);
      } else {
        messageDiv.textContent = result.detail || "Error signing up for activity";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Error connecting to server";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Function to unregister a participant
  window.unregisterParticipant = async (activityName, email) => {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/unregister`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email })
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = "Successfully unregistered from the activity!";
        messageDiv.className = "message success";
        // Reload activities to show updated participants after a short delay
        setTimeout(() => {
          fetchActivities();
        }, 100);
      } else {
        messageDiv.textContent = result.detail || "Error unregistering from activity";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Error connecting to server";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  };

  // Initialize app
  fetchActivities();
});
