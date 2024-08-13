const fetchConversion_rates = async () => {
  let curr1ToCurr2 = {};
  try {
    const response = await fetch(`${process.env.CONVERSION_RATES}`);
    // console.log(process.env.CONVERSION_RATES);
    const result = await response.json();
// console.log(result)
    curr1ToCurr2 = result.conversion_rates;
    // console.log(curr1ToCurr2)
    //   console.log('success');
    return curr1ToCurr2;
    //   const curr = "USD";
    //   const converted = curr1ToCurr2[curr];
    //   // console.log(converted);
  } catch (error) {
    console.error(error);
  }

  
};

module.exports = fetchConversion_rates;
