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
  const [storeRating, setStoreRating] = useState(storeData.attributes.rating);
  const topBooks = included
    .filter(item => item.type === 'books')
    .sort((a, b) => b.attributes.copiesSold - a.attributes.copiesSold)
    .slice(0, 2);

  const starRating = [];
  for (let i = 1; i <= 5; i++) {
    const starClass = i <= storeRating ? 'filled' : '';
    starRating.push(
      <i
        key={i}
        className={`fas fa-star ${starClass}`}
        style={{ color: starClass ? 'goldenrod' : 'black', marginLeft: '5px' }}
        onClick={() => handleRatingClick(i)}
      ></i>
    );
  }

  const handleRatingClick = rating => {
    setStoreRating(rating);
  };

  const establishmentDate = new Date(storeData.attributes.establishmentDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const website = storeData.attributes.website.replace(/^https?:\/\//, '');

  return (
    <div className="store-box">
      <div className="store">
        <div className="store-info">
          <img src={storeImage} alt={storeName} />
          <h2>{storeName}</h2>
          <div className="rating">{starRating}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th colSpan="2">Top Selling Books</th>
            </tr>
            <tr>
              <th>Book Name</th>
              <th>Author</th>
            </tr>
          </thead>
          <tbody>
            {topBooks.length > 0 ? (
              topBooks.map(book => (
                <tr key={book.id}>
                  <td className="left-align">{book.attributes.name}</td>
                  <td className="left-align">{getAuthorName(book.relationships.author.data, included)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No copies sold</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="store-footer">
          <p className="establishment-date">{`Established: ${establishmentDate}`}</p>
          <p className="website">
            <a href={`https://${website}`}>{website}</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function getAuthorName(authorData, included) {
  const author = included.find(item => item.type === 'authors' && item.id === authorData.id);
  return author ? author.attributes.fullName : '';
}

export default App;
