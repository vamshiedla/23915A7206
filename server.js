const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const WINDOW_SIZE = 10;

const numberStore = [];

const fetchNumbers = async (type) => {
  try {
    const response = await axios.get(`http://20.244.56.144/test/${type}`, { timeout: 500 });
    console.log('API Response:', response.data);
    return response.data.numbers;
  } catch (error) {
    console.error('Error fetching numbers:', error.message);
    return [];
  }
};

const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return (sum / numbers.length).toFixed(2);
};

app.get('/numbers/:type', async (req, res) => {
  const { type } = req.params;
  const validTypes = ['p', 'f', 'e', 'r'];

  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Use p, f, e, or r.' });
  }

  const prevState = [...numberStore];
  const newNumbers = await fetchNumbers(type);

  if (newNumbers.length === 0) {
    return res.json({
      windowPrevState: prevState,
      windowCurrState: numberStore,
      numbers: [],
      avg: 0
    });
  }

  newNumbers.forEach((num) => {
    if (!numberStore.includes(num)) {
      if (numberStore.length >= WINDOW_SIZE) {
        numberStore.shift();
      }
      numberStore.push(num);
    }
  });

  const average = calculateAverage(numberStore);

  const formattedResponse = {
    windowPrevState: prevState,
    windowCurrState: numberStore,
    numbers: newNumbers,
    avg: parseFloat(average)
  };

  console.log('Response:', formattedResponse);

  res.json(formattedResponse);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
