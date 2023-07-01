import React, { useEffect, useState } from 'react';

function App() {
  const [bookstores, setBookstores] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/stores/')
      .then(response => response.json())
      .then(data => {
        const storeIDs = data.data.map(store => store.id);

        Promise.all(
          storeIDs.map(storeID =>
            fetch(`http://localhost:3000/stores/${storeID}`)
              .then(response => response.json())
              .catch(error => console.error(`Error fetching data for store ID ${storeID}:`, error))
          )
        )
          .then(dataArray => {
            setBookstores(dataArray.filter(data => data !== null));
          })
          .catch(error => console.error('Error fetching store data:', error));
      })
      .catch(error => console.error('Error fetching store IDs:', error));
  }, []);

  return (
    <div className="App">
      {bookstores.map(storeData => (
        <Store key={storeData.data.id} storeData={storeData.data} included={storeData.included} />
      ))}
    </div>
  );
}

function Store({ storeData, included }) {
  const storeImage = storeData.attributes.storeImage;
  const storeName = storeData.attributes.name;
  const storeRating = storeData.attributes.rating;
  const topBooks = included.filter(item => item.type === 'books');

  return (
    <div className="store">
      <img src={storeImage} alt={storeName} />
      <div>
        <h2>{storeName}</h2>
        <p>Rating: {storeRating}</p>
        <p>Top Books:</p>
        <ul>
          {topBooks.map(book => (
            <li key={book.id}>{book.attributes.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
