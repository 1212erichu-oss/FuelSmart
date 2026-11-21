const FuelStorage = (() => {
  const KEY = 'fuelsmart-v1';
  const sample = [
    { name: 'Chicken sandwich', group: 'protein', energy: 'Protein can help support steady energy.' },
    { name: 'Bean burrito', group: 'protein', energy: 'Beans provide protein and carbohydrates for energy.' },
    { name: 'Eggs', group: 'protein', energy: 'Eggs provide protein to help make a filling meal.' },
    { name: 'Brown rice', group: 'grain', energy: 'Whole grains can provide longer-lasting energy.' },
    { name: 'Oatmeal', group: 'grain', energy: 'Oats provide carbohydrates and fiber for lasting fuel.' },
    { name: 'Apple', group: 'fruit', energy: 'Fruit provides carbohydrates and helpful nutrients.' },
    { name: 'Banana', group: 'fruit', energy: 'A banana provides carbohydrates and potassium.' },
    { name: 'Carrots', group: 'vegetable', energy: 'Vegetables add vitamins, minerals, and fiber.' },
    { name: 'Broccoli', group: 'vegetable', energy: 'Broccoli adds fiber and helpful vitamins and minerals.' },
    { name: 'Milk', group: 'dairy', energy: 'Milk provides protein and calcium.' },
    { name: 'Yogurt', group: 'dairy', energy: 'Yogurt provides protein and calcium for a balanced meal.' }
  ];
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { plate: sample.slice(0, 2) }; } catch { return { plate: sample.slice(0, 2) }; }
  }
  function write(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
  return { sample, read, write };
})();
