const FuelStorage = (() => {
  const KEY = 'fuelsmart-v1';
  const sample = [
    { name: 'Chicken sandwich', group: 'protein', energy: 'Protein can help support steady energy.' },
    { name: 'Bean burrito', group: 'protein', energy: 'Beans provide protein and carbohydrates for energy.' },
    { name: 'Eggs', group: 'protein', energy: 'Eggs provide protein to help make a filling meal.' },
    { name: 'Turkey wrap', group: 'protein', energy: 'Turkey provides protein, and the wrap adds fuel from grains.' },
    { name: 'Tofu', group: 'protein', energy: 'Tofu provides plant-based protein for a balanced meal.' },
    { name: 'Brown rice', group: 'grain', energy: 'Whole grains can provide longer-lasting energy.' },
    { name: 'Oatmeal', group: 'grain', energy: 'Oats provide carbohydrates and fiber for lasting fuel.' },
    { name: 'Whole-wheat pasta', group: 'grain', energy: 'Whole-wheat pasta provides carbohydrates and fiber.' },
    { name: 'Corn', group: 'grain', energy: 'Corn provides carbohydrates that the body can use for fuel.' },
    { name: 'Apple', group: 'fruit', energy: 'Fruit provides carbohydrates and helpful nutrients.' },
    { name: 'Banana', group: 'fruit', energy: 'A banana provides carbohydrates and potassium.' },
    { name: 'Orange', group: 'fruit', energy: 'An orange provides carbohydrates, water, and vitamin C.' },
    { name: 'Strawberries', group: 'fruit', energy: 'Strawberries provide carbohydrates, fiber, and vitamin C.' },
    { name: 'Carrots', group: 'vegetable', energy: 'Vegetables add vitamins, minerals, and fiber.' },
    { name: 'Broccoli', group: 'vegetable', energy: 'Broccoli adds fiber and helpful vitamins and minerals.' },
    { name: 'Spinach', group: 'vegetable', energy: 'Spinach adds fiber and helpful vitamins and minerals.' },
    { name: 'Sweet potato', group: 'vegetable', energy: 'Sweet potato provides carbohydrates, fiber, and vitamins.' },
    { name: 'Milk', group: 'dairy', energy: 'Milk provides protein and calcium.' },
    { name: 'Yogurt', group: 'dairy', energy: 'Yogurt provides protein and calcium for a balanced meal.' },
    { name: 'Cheese', group: 'dairy', energy: 'Cheese provides protein and calcium.' }
  ];
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { plate: sample.slice(0, 2) }; } catch { return { plate: sample.slice(0, 2) }; }
  }
  function write(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
  return { sample, read, write };
})();
