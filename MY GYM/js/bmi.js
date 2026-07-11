(function () {
  const form = document.querySelector("#bmiForm");
  const result = document.querySelector("#bmiResult");

  if (!form || !result) {
    return;
  }

  const getCategory = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const height = Number(form.height.value);
    const weight = Number(form.weight.value);

    if (!height || !weight || height < 80 || weight < 25) {
      result.textContent = "Please enter a realistic height and weight.";
      return;
    }

    const bmi = weight / ((height / 100) ** 2);
    const category = getCategory(bmi);
    result.textContent = `Your BMI is ${bmi.toFixed(1)} | ${category}`;
  });
})();
