import { useEffect, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { useContext } from "react";
import Header from "./Header";
import shrug from "../assets/shrug.png";


function Diet() {
  let loggedData = useContext(UserContext);

  const [items, setItems] = useState([]);
  const [date, setDate] = useState(new Date());
  const [eatenDate, setEatenDate] = useState("");
  const [fetchedData, setFetchedData] = useState([]); // New state variable
  const [isLoading, setIsLoading] = useState(false);

  let [total, setTotal] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalcarbs: 0,
    totalFat: 0,
    totalFibre: 0,
  });

  function formatNumberWithLeadingZero(number) {
    return number < 10 ? `0${number}` : number;
  }

  useEffect(() => {
    setIsLoading(true);
  const adjustedDate = new Date(date);
  adjustedDate.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  console.log("Updated date state:", date); // Add this line

  const formattedMonth = formatNumberWithLeadingZero(
    adjustedDate.getMonth() + 1
  );
  const formattedDay = formatNumberWithLeadingZero(adjustedDate.getDate());

  fetch(
    `/tracking/${
      loggedData.loggedUser.userid
    }/${formattedMonth}-${formattedDay}-${adjustedDate.getFullYear()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${loggedData.loggedUser.token}`,
      },
    }
  )
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch data');
    }
  })
  .then((data) => {
    setItems(data);
    setFetchedData(data);
    if (data && data.length > 0) {
      setEatenDate(data[0].eatenDate);
    }
  })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => setIsLoading(false));
    return () => setIsLoading(false);
}, [date]);  // Removed 'items' from the dependency array

  useEffect(() => {
    calcTotal();
  }, [items]);

  function calcTotal() {
    let totalCopy = {
      totalCalories: 0,
      totalProtein: 0,
      totalcarbs: 0,
      totalFat: 0,
      totalFibre: 0,
    };

    items.forEach((item) => {
      totalCopy.totalCalories += item.details.calories;
      totalCopy.totalProtein += item.details.protein;
      totalCopy.totalcarbs += item.details.carbohydrates;
      totalCopy.totalFat += item.details.fat;
      totalCopy.totalFibre += item.details.fibre;
    });

    setTotal(totalCopy);
  }

  return (
    <section className="bg-slate-800 text-white h-screen p-6 flex-row items-center">
      {isLoading ? (
        <div className="loading-indicator">Loading...</div>
      ) : (
        <>
          <Header />
          <div>
            <p className="text-center">Nutrient intake by date:</p>
            <input
              type="date"
              className="mt-1 w-full h-6 indent-3 text-base rounded-lg text-gray-500 focus:text-gray-900"
              onChange={(event) => {
                setDate(new Date(event.target.value));
              }}
            />
  
            {(items.length === 0 && fetchedData.length === 0) && (
              <div className="flex flex-col items-center">
                <h2 className="text-xl mt-6">
                  Sorry...You did not upload your intake on this day.
                </h2>
                <h2 className="text-xl">Please try another date.</h2>
                <img
                  src={shrug}
                  alt="clipart man shrugging"
                  className="w-96 object-scale-down"
                />
              </div>
            )}
  
            {items.map((item) => {
              return (
                <div
                  className="w-full p-6 bg-slate-700 rounded-lg my-3"
                  key={item._id}
                >
                  <h2 className="text-2xl text-orange-500 font-bold">
                    {item.foodId.name}{" "}
                  </h2>
                  <h3 className="text-lg">
                    ({item.details.calories.toFixed(2)}kcal for {item.quantity.toFixed(2)}g)
                  </h3>
                  <p className="mt-3 text-gray-300">
                    Protein {item.details.protein.toFixed(2)}g - Carbs{" "}
                    {item.details.carbohydrates.toFixed(2)}g - Fat {item.details.fat.toFixed(2)}g - Fibre{" "}
                    {item.details.fibre.toFixed(2)}g
                  </p>
                </div>
              );
            })}
  
            {items.length > 0 && (
              <div className="w-full p-6 bg-slate-700 rounded-lg my-3">
                <h2 className="text-2xl text-orange-500 font-bold">
                  Your Total Intake for:{" "}
                  <span className="text-white text-xl font-normal">
                    {eatenDate}
                  </span>
                </h2>
                <h3 className="text-lg">
                  Calories {total.totalCalories.toFixed(2)} kcal
                </h3>
                <p className="mt-3 text-gray-300">
                  Protein {total.totalProtein.toFixed(2)}g - Carbs {total.totalcarbs.toFixed(2)}g - Fat{" "}
                  {total.totalFat.toFixed(2)}g - Fibre {total.totalFibre.toFixed(2)}g
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
  
}

export default Diet;
