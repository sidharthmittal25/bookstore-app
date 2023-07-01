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
  const topBooks = included
    .filter(item => item.type === 'books')
    .sort((a, b) => b.attributes.copiesSold - a.attributes.copiesSold)
    .slice(0, 2);

  return (
    <div className="store">
      <div className="store-info">
        <img src={storeImage} alt={storeName} />
        <div>
          <h2>{storeName}</h2>
          <p>Rating: {storeRating}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Book Name</th>
            <th>Author</th>
          </tr>
        </thead>
        <tbody>
          {topBooks.map(book => (
            <tr key={book.id}>
              <td>{book.attributes.name}</td>
              <td>{getAuthorName(book.relationships.author.data, included)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getAuthorName(authorData, included) {
  const author = included.find(item => item.type === 'authors' && item.id === authorData.id);
  return author ? author.attributes.fullName : '';
}

export default App;
