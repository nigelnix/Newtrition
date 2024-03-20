import { useEffect, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { useContext } from "react";
import Header from "./Header";
import shrug from "../assets/shrug.png";




  const Diet = () => {
    let loggedData = useContext(UserContext);
    const [date, setDate] = useState(new Date());
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState({ calories: 0, protein: 0, carbohydrates: 0, fat: 0, fibre: 0 });
    const [eatenDate, setEatenDate] = useState("");
   
  
    const formatDate = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Add leading zero for single-digit months
      const day = String(dateObj.getDate()).padStart(2, "0"); // Add leading zero for single-digit days
      return `${year}-${month}-${day}`;
    };

   useEffect(() => {
    const formattedDate = formatDate(date);


    fetch(
      `/tracking/${
        loggedData.loggedUser.userid
      }/${formattedDate}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${loggedData.loggedUser.token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        
        setItems(data);

        if (data && data.length > 0) {
          setEatenDate(formattedDate);
        }
      })
      .catch((err) => {
        console.log(err); // this line is returning a typeError - Failed to Fetch
      });
  }, [date]); // Removed 'items' from the dependency array

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
    <section className="bg-slate-800 text-white h-full p-6 flex-row items-center">
      <Header />
      <div>
        <p className="text-center">Nutrient intake by date:</p>
        <input
          type="date"
          className="mt-1 w-full h-6 indent-3 text-base rounded-lg text-gray-500 focus:text-gray-900"
          onChange={(event) => {
            const selectedDate = event.target.value;
  const adjustedDate = new Date(selectedDate);
  const formattedDay = adjustedDate.getDate().toString().padStart(2, '0'); // Ensure two digits for day
  const formattedMonth = (adjustedDate.getMonth() + 1).toString().padStart(2, '0'); // Ensure two digits for month
  const formattedYear = adjustedDate.getFullYear();
  const formattedDate = `${formattedDay}/${formattedMonth}/${formattedYear}`;
  console.log("Selected Date (before conversion):", selectedDate);
  console.log("Converted Date (after conversion):", formattedDate);
  setDate(formattedDate); // Set the formatted date to state
          }}
        />

        {items.length === 0 && (
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
                ({item.details.calories}kcal for {item.quantity}g)
              </h3>
              <p className="mt-3 text-gray-300">
                Protein {item.details.protein}g - Carbs{" "}
                {item.details.carbohydrates}g - Fat {item.details.fat}g - Fibre{" "}
                {item.details.fibre}g
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
              Protein {total.totalProtein}g - Carbs {total.totalcarbs}g - Fat{" "}
              {total.totalFat}g - Fibre {total.totalFibre}g
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Diet;
