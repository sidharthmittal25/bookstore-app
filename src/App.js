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
    }).replace(/\//g, '.');

  const countryCode = included.find(item => item.type === 'countries' && item.id === storeData.relationships.countries.data.id)?.attributes.code;
  const [flagUrl, setFlagUrl] = useState(null);

  useEffect(() => {
    const fetchFlag = async () => {
      try {
        const response = await fetch(`https://flagsapi.com/${countryCode}/flat/64.png`);
        if (response.ok) {
          const flagData = await response.blob();
          const flagImageUrl = URL.createObjectURL(flagData);
          setFlagUrl(flagImageUrl);
        } else {
          console.log('Failed to fetch flag');
        }
      } catch (error) {
        console.log('Error fetching flag:', error);
      }
    };

    if (countryCode) {
      fetchFlag();
    }
  }, [countryCode]);

  const websiteLink = storeData.attributes.website.replace(/^https?:\/\//, '');

  return (
    <div className="store-box">
      <div className="column">
        <div className="store">
          <div className="store-info">
            <div className="image-container">
              <img src={storeImage} alt={storeName} />
            </div>
          </div>
          <div className="store-footer">
            <p className="established-website">
              {`Established: ${establishmentDate}  `}
                  <a href={storeData.attributes.website} target="_blank" rel="noopener noreferrer">
                    <button className="visit-store-button">Visit Store</button>
                  </a>
            </p>
            <div className="country-code-container">
              {flagUrl && <img src={flagUrl} alt={`Flag of ${countryCode}`} />}
              <p className="country-code">{`Country Code: ${countryCode || 'N/A'}`}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="column">
        <div className="store-details">
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
      </div>
    </div>
  );
}

function getAuthorName(authorData, included) {
  const author = included.find(item => item.type === 'authors' && item.id === authorData.id);
  return author ? author.attributes.fullName : 'Unknown Author';
}

export default App;
