import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import Cookies from "js-cookie";
import { database, auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { Filters } from "./Filters";
import { AuthModal } from "./AuthModal";
import { ChartSection } from "./ChartSection";
import "./App.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedAge, setSelectedAge] = useState("15-25");
  const [selectedGender, setSelectedGender] = useState("Male");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [applyFilters, setApplyFilters] = useState(true);
  const [homeText, sethomeText] = useState(()=>{
    return localStorage.getItem("homeText")==="true";
  });


  useEffect(() => {
    localStorage.setItem("homeText", homeText);
  }, [homeText]);

  // Firebase onAuthStateChanged to track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Reading query params from URL and setting state accordingly
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const age = params.get('age');
    const gender = params.get('gender');
    const start = params.get('start');
    const end = params.get('end');

    if (age) setSelectedAge(age);
    if (gender) setSelectedGender(gender);
    if (start && end) setDateRange({ start, end });
  }, [location.search]);

  // Update URL query params when filters change
  const updateURL = () => {
    const params = new URLSearchParams();
    params.set('age', selectedAge);
    params.set('gender', selectedGender);
    if (dateRange.start && dateRange.end) {
      params.set('start', dateRange.start);
      params.set('end', dateRange.end);
    }
    navigate(`?${params.toString()}`, { replace: true });
  };

  // Sign-up handler
  const handleSignup = async () => {
    if (!validateEmail(email) || password === '') {
      alert("Please enter a valid email and password.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setShowForm(false);
      sethomeText(false);
      alert("Signup successful");
    } catch (error) {
      console.error("Error during sign up:", error.message);
      if (error.code === "auth/email-already-in-use") {
        alert("Email is already in use. Please log in.");
      } else {
        alert("Something went wrong during signup. Please try again.");
      }
    }
  };

  // Login handler
  const handleLogin = async () => {
    if (!validateEmail(email) || password === '') {
      alert("Please enter a valid email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowForm(false);
      sethomeText(false);
      alert("Login successful");
    } catch (error) {
      console.error("Error during login:", error.message);
      if (error.code === "auth/user-not-found") {
        alert("No account found with this email. Please sign up.");
      } else if (error.code === "auth/wrong-password") {
        alert("Incorrect password. Please try again.");
      } else {
        alert("Something went wrong during login. Please try again.");
      }
    }
  };

  // Email validation
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
  };

  // Logout handler
  const handleLogout = () => {
    signOut(auth);
    sethomeText(true)
  };

  // Convert date string to JavaScript Date object
  const convertToJSDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    let day = parseInt(parts[0]);
    let month = parseInt(parts[1]);
    let year = parseInt(parts[2]);

    return new Date(year, month - 1, day);
  };

  // Process data for charts based on selected filters
  const processData = useCallback((data) => {
    const startDate = dateRange.start ? convertToJSDate(dateRange.start) : null;
    const endDate = dateRange.end ? convertToJSDate(dateRange.end) : null;

    const filteredData = data.filter((item) => {
      const itemDate = convertToJSDate(item.Day);
      return (
        item.Age === selectedAge &&
        item.Gender === selectedGender &&
        (!startDate || itemDate >= startDate) &&
        (!endDate || itemDate <= endDate)
      );
    });

    const dates = filteredData.map((item) => item.Day);
    const categoryData = ['A', 'B', 'C', 'D', 'E', 'F'].map((category) =>
      filteredData.map((item) => item[category])
    );

    const colors = [
      "rgba(111, 225, 225, 0.5)", 
      "rgba(153,102,255,0.5)", 
      "rgba(255,159,64,0.5)", 
      "rgba(212, 210, 70, 0.5)", 
      "rgba(255,99,132,0.5)", 
      "rgba(28, 111, 163, 0.5)"
    ];

    setChartData({
      labels: dates,
      datasets: categoryData.map((data, index) => ({
        label: `Category ${String.fromCharCode(65 + index)}`,
        data,
        backgroundColor: colors[index],
        stack: 'Stack 0',
      })),
    });

    setLineChartData({
      labels: dates,
      datasets: [
        {
          label: "Combined Trend (A to F)",
          data: filteredData.map((item) =>
            ["A", "B", "C", "D", "E", "F"].reduce((acc, key) => acc + item[key], 0)
          ),
          borderColor: "rgba(153, 102, 255, 1)",
          fill: false,
          tension: 0.1,
        },
      ],
    });

  }, [dateRange, selectedAge, selectedGender]);

  // Fetch and process data from Firebase
  useEffect(() => {
    if (applyFilters) {
      const fetchData = async () => {
        try {
          const dataRef = ref(database, "/");
          const snapshot = await get(dataRef);
          if (snapshot.exists()) {
            const rawData = snapshot.val();
            const dataArray = Object.values(rawData);
            processData(dataArray);
            setApplyFilters(false);
          } else {
            console.log("No data available");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [applyFilters, dateRange, selectedAge, selectedGender, processData]);

  // Handle date changes
  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    if (!dateValue) return;

    const [year, month, day] = dateValue.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    setDateRange((prev) => ({ ...prev, [e.target.name]: formattedDate }));
    Cookies.set(e.target.name, formattedDate);
    updateURL();
  };

  // Clear all filters and reset charts
  const clearAllFilters = () => {
    setSelectedAge("15-25");
    setSelectedGender("Male");
    setDateRange({ start: "", end: "" });
    setApplyFilters(true);
    Cookies.remove("start");
    Cookies.remove("end");
    updateURL();
  };

  return (
    <div className="app-container">
      <header className="header">
        <img src="/moon (2).png" alt="Moon Logo" className="logo" />
        {user ? (
          <div>
            <p>Welcome, {user.email}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <button onClick={() => {setShowForm(true); sethomeText(false);}}>Login / Sign Up</button>
          </div>
        )}
      </header>
      {homeText && (
        <img src="/background.png" alt="chart-img" className="background"/>
      )}
      {showForm && (
        <AuthModal
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleSignup={handleSignup}
          handleLogin={handleLogin}
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
          setShowForm={setShowForm}
          sethomeText={sethomeText}
        />
      )}

      {user && (
        <div className="dashboard-container">
          <div className="sidebar">
            <Filters
              selectedAge={selectedAge}
              setSelectedAge={setSelectedAge}
              selectedGender={selectedGender}
              setSelectedGender={setSelectedGender}
              dateRange={dateRange}
              setDateRange={setDateRange}
              handleDateChange={handleDateChange}
              setApplyFilters={setApplyFilters}
              clearAllFilters={clearAllFilters}
            />
          </div>
          <div className="content">
            <ChartSection chartData={chartData} lineChartData={lineChartData} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
