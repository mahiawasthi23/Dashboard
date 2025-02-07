import React, { useState, useEffect, useCallback } from "react";
import { Bar, Line } from "react-chartjs-2";
import { ref, get } from "firebase/database";
import Cookies from "js-cookie";
import Chart from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";
import { database, auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";

Chart.register(zoomPlugin);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);


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

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setShowForm(false); 
      alert("Sigup successfully");
    } catch (error) {
      console.error("Error during sign up:", error.message);
      alert("You have already account");
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowForm(false); 
      alert("Login successfully");
    } catch (error) {
      console.error("Error during login:", error.message);
      alert("Signup before login");
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const convertToJSDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;

    let month = parseInt(parts[0]);
    let day = parseInt(parts[1]);
    let year = parseInt(parts[2]);

    if (month > 12) {
      [day, month] = [month, day];
    }

    return new Date(year, month - 1, day);
  };


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
          label: "Trend",
          data: filteredData.map((item) => item.B),
          borderColor: "rgba(153, 102, 255, 1)",
          fill: false,
          tension: 0.1,
        },
      ],
    });
  }, [dateRange, selectedAge, selectedGender]);


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

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    if (!dateValue) return;

    const [year, month, day] = dateValue.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    setDateRange((prev) => ({ ...prev, [e.target.name]: formattedDate }));
    Cookies.set(e.target.name, formattedDate);
    updateURL();
  };


  return (
    <div className="app-container">
      <header className="header">
        <img src="/moon (2).png" alt="Moon Logo" className="logo"/>
        {user ? (
          <div>
            <p>Welcome, {user.email}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <button onClick={() => setShowForm(true)}>Login / Sign Up</button>
          </div>
        )}
      </header>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            {isSignUp ? (
              <button onClick={handleSignup}>Sign Up</button>
            ) : (
              <button onClick={handleLogin}>Login</button>
            )}
            <button onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Switch to Login" : "Switch to Sign Up"}
            </button>
            <button onClick={() => setShowForm(false)}>Close</button>
          </div>
        </div>
      )}

      {user && (
        <div className="dashboard-container">
          <div className="sidebar">
            <h3>Filters</h3>
            <label>
              Age:
              <select value={selectedAge} onChange={(e) => setSelectedAge(e.target.value)}>
                <option>15-25</option>
                <option>&gt;25</option>
              </select>
            </label>
            <label>
              Gender:
              <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </label>
            <label>
              Date Range:
              <input
                type="date"
                name="start"
                value={dateRange.start ? dateRange.start.split("/").reverse().join("-") : ""}
                onChange={handleDateChange}
              />
              <input
                type="date"
                name="end"
                value={dateRange.end ? dateRange.end.split("/").reverse().join("-") : ""}
                onChange={handleDateChange}
              />
            </label>
            <button onClick={() => setApplyFilters(true)}>Apply Filters</button>
          </div>
          <div className="content">
            <div className="charts">
              <div className="chart">
                <h3>Bar Chart</h3>
                <Bar data={chartData} options={{ responsive: true, scales: { x: { stacked: true }, y: { stacked: true } } }} />
              </div>
              <div className="chart">
                <h3>Line Chart</h3>
                <Line data={lineChartData} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
