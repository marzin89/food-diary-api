// Hämtar express
const express = require('express');

// Hämtar cors
const cors = require('cors');

// Läser in express
const app = express();

// Betrodda domäner
app.use(cors({
    origin: ['https://food-diary-project.herokuapp.com', 'http://localhost:3000'],
}));

// Hämtar body-parser
const bodyParser = require('body-parser');
const {urlencoded} = require('body-parser');

// Använder den port som finns lagrad i miljövariabeln, annars 3030
let port = process.env.PORT;

if (port == null || port == '') {
    port = 3030;
}

// Definierar mapp för visning av filer
app.use(express.static('public'));

// Läser in body-parser för att kunna lägga till poster
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Hämtar mongoose
const mongoose = require('mongoose');

// URL till databasen
const mongoDB = 'mongodb+srv://marco:13uD4yw$E9}hCc*-@cluster0.dydxl.mongodb.net/foodDiary?retryWrites=true&w=majority';

// Ansluter till databasen och lagrar anslutningen
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

// Skriver ut ett felmeddelande om anslutningen misslyckades
db.on('error', console.error.bind(console, 'Kunde inte ansluta till databasen.'));

// Scheman och modeller
// Schema samt modell för användare
const userSchema = new mongoose.Schema({
    username:  String,
    password:  String,
    firstName: String,
    lastName:  String,
    email:     String
});

const user = mongoose.model('users', userSchema);

// Schema samt modell för livsmedel
const foodSchema = new mongoose.Schema({
    name:          String,
    category:      String,
    calories:      String,
    protein:       String,
    carbohydrates: String,
    fats:          String,
    salt:          String,
    water:         String,
    ash:           String
});

const food = mongoose.model('foods', foodSchema);

// Schema samt modell för ingredienser
const ingredientSchema = new mongoose.Schema({
    food:          String,
    category:      String,
    quantity:      String,
    calories:      String,
    protein:       String,
    carbohydrates: String,
    fats:          String,
    salt:          String,
    water:         String,
    ash:           String
});

const Ingredient = mongoose.model('ingredients', ingredientSchema);

// Schema samt modell för måltider
const mealSchema = new mongoose.Schema({
    username:           String,
    mealName:           String,
    mealID:             Number,
    meal: [             
                        ingredientSchema
    ],       
    totalCalories:      String,
    totalProtein:       String,
    totalCarbohydrates: String,
    totalFats:          String,
    totalSalt:          String,
    totalWater:         String,
    totalAsh:           String,
    date:               Date
});

const meal = mongoose.model('meals', mealSchema);

// Funktioner
// Inloggning
app.post('/login', function(req, res) {

    // Lagrar användarnamn och lösenord
    const username = req.body.username;
    const password = req.body.password;

    // Lagrar status för valideringen
    let response = {
        userExists: false,
    }

    // Söker igenom collection
    user.find(function(err, users) {

        // Skickar statuskod 500 om det inte gick att hämta användaruppgifter
        if(err) {
            res.status(500).send();

        } else {
            // Loopar igenom användarna och jämför användarnamn och lösenord
            users.forEach((element) => {
                if (element.username == username && element.password == password) {
                    // Ändrar status till true om användarnamn och lösenord matchar användaren
                    response.userExists = true;
                }
            })

            // Skickar statuskod 200 och status vid lyckad validering
            if (response.userExists) {
                res.contentType('application/json');
                const json = JSON.stringify(response);
                res.status(200).send(json);
            
            // Skickar statuskod 404 och status vid misslyckad validering
            } else {
                res.contentType('application/json');
                const json = JSON.stringify(response);
                res.status(404).send(json);
            }
        }
    });
});

// Hämtar alla livsmedel inom en viss kategori
app.get('/foods/category/:category', function(req, res) {

    // Läser in kategorin som skickats med fetch-anropet
    const category = req.params.category;

    // Söker igenom collection
    food.find({category: category}, function(err, document) {

        // Skickar statuskod 404 om inga livsmedel hittades
        if (!document) {
            res.status(404).send();

        // Skickar alla livsmedel inom kategorin
        } else {
            res.contentType('application/json');
            const json = JSON.stringify(document);
            res.status(200).send(json);
        }

        // Skickar statuskod 500 om det inte gick att söka
        if (err) {
            res.status(500).send();
        }
    });
});

// Hämtar livsmedel baserat på namn
app.get('/foods/name/:name', function(req, res) {

    // Läser in namnet från fetch-anropet
    const name = req.params.name;

    // Söker igenom collection
    food.find({name: name}, function(err, document) {
        if (!document) {
            // Skickar statuskod 404 om livsmedlet inte finns
            res.status(404).send();

        } else {
            // Skickar statuskod 200 och livsmedlet
            res.contentType('application/json');
            const json = JSON.stringify(document);
            res.status(200).send(json);
        }
        
        // Skickar statuskod 500 om det inte gick att söka
        if (err) {
            res.status(500).send();
        }
    });
});

// Hämtar livsmedel baserat på namn och kategori
app.get('/foods/name/:name/category/:category', function(req, res) {

    // Läser in namnet och kategorin från fetch-anropet
    const name = req.params.name;
    const category = req.params.category;

    // Söker igenom collection
    food.find(
        {name: name, category: category}, 
        function(err, document) {

        // Skickar statuskod 404 om livsmedlet inte finns
        if (!document) {
            res.status(404).send();

        // Skickar statuskod 200 och livsmedlet
        } else {
            res.contentType('application/json');
            const json = JSON.stringify(document);
            res.status(200).send(json);
        }

        // Skickar statuskod 500 om det inte gick att söka
        if (err) {
            res.status(500).send();
        }
    });
});

// Lägger till måltider
app.post('/meals', function(req, res) {

    // Läser in uppgifterna från fetch-anropet
    const body = req.body;

    // Ny måltid, lägger till uppgifterna från fetch-anropet
    const document = new meal({
        username:           body.username,
        mealName:           body.mealName,
        mealID:             body.mealID,
        meal:               body.meal,
        totalCalories:      body.totalCalories,
        totalProtein:       body.totalProtein,
        totalCarbohydrates: body.totalCarbohydrates,
        totalFats:          body.totalFats,
        totalSalt:          body.totalSalt,
        totalWater:         body.totalWater,
        totalAsh:           body.totalAsh,
        date:               body.date
    });

    // Lägger till måltiden
    document.save(function(err) {

        // Skickar statuskod 500 om det inte gick att lägga till måltiden
        if (err) {
            res.status(500).send();

        // Skickar statuskod 200 och måltiden vid lyckad lagring
        } else {
            res.contentType('application/json');
            const json = JSON.stringify(body);
            res.status(200).send(json);
        }
    });
});

// Hämtar alla måltider för en användare
app.get('/meals/user/:user', function(req, res) {

    // Läser in användarnamnet från fetch-anropet
    const user = req.params.user;

    // Hämtar alla måltider i omvänd datumordning
    meal.find({username: user}).sort({ date: -1 }).exec(function(err, meals) {

        // Skickar statuskod 404 om inga måltider hittades
        if (!meals) {
            res.status(404).send();

        // Skickar statuskod 200 och alla måltider
        } else {
            res.contentType('application/json');
            const json = JSON.stringify(meals);
            res.status(200).send(json);
        }

        // Skickar statuskod 500 om det inte gick att hämta måltider
        if (err) {
            res.status(500).send();
        }
    });
});

// Uppdaterar måltider för en användare
app.put('/meals/id/:ID/user/:user', function(req, res) {

    // Läser in ID, användarnamn och body från fetch-anropet
    const ID = req.params.ID;
    const user = req.params.user;
    const body = req.body;

    // Uppdaterar collection
    meal.updateOne({mealID: ID, username: user}, 
        {
            username:           body.username,
            mealName:           body.mealName,
            meal:               body.meal,
            totalCalories:      body.totalCalories,
            totalProtein:       body.totalProtein,
            totalCarbohydrates: body.totalCarbohydrates,
            totalFats:          body.totalFats,
            totalSalt:          body.totalSalt,
            totalWater:         body.totalWater,
            totalAsh:           body.totalAsh,
            date:               body.date,
        },
        function(err) {

        // Skickar statuskod 500 om det inte gick att uppdatera måltiden
        if(err) {
            res.status(500).send();

        // Skickar statuskod 200 och måltiden vid lyckad uppdatering
        } else {
            res.contentType('application/json');
            const json = JSON.stringify(body);
            res.status(200).send(json);
        }
    })
})

// Raderar måltider för en användare
app.delete('/meals/id/:ID/user/:user', function(req, res) {

    // Läser in ID och användarnamn från fetch-anropet
    const ID = req.params.ID;
    const user = req.params.user;

    // Raderar måltiden
    meal.findOneAndDelete({mealID: ID, username: user}, function(err, document) {

        // Skickar statuskod 500 om det inte gick att radera måltiden
        if (err) {
            res.status(500).send();

        // Skickar statuskod 200 och måltiden vid lyckad borttagning
        } else {
            res.contentType('application/json');
            const json = JSON.stringify(document);
            res.status(200).send(json);
        }
    });
});

// Hämtar måltider för en viss tidsperiod
app.get('/meals/user/:user/range/:range', function(req, res) {

    // Läser in användarnamn och vald tidsperiod från fetch-anropet
    const user = req.params.user;
    const range = req.params.range;

    // Här lagras startdatumet
    let startDate = new Date();

    // Här lagras måltiderna
    let mealArr = [];

    // Beräknar startdatumet baserat på den valda tidsperioden
    switch(range) {
        case 'Senaste månaden':
            startDate.setDate(startDate.getDate() - 30);
            startDate.toLocaleDateString();
        break;

        case 'Senaste tre månaderna':
            startDate.setDate(startDate.getDate() - 90);
            startDate.toLocaleDateString();
        break;

        case 'Senaste halvåret':
            startDate.setDate(startDate.getDate() - 180);
            startDate.toLocaleDateString();
        break;

        case 'Senaste året':
            startDate.setDate(startDate.getDate() - 365);
            startDate.toLocaleDateString();
        break;

        default:
            startDate.setDate(startDate.getDate() - 7);
            startDate.toLocaleDateString();
        break;
    }

    // Hämtar alla måltider för användaren i omvänd datumordning
    meal.find({username: user}).sort({ date: -1 }).exec(function(err, meals) {
        // Skickar statuskod 404 om inga måltider hittades
        if (!meals) {
            res.status(404).send();

        } else {
            /* Loopar igenom måltiderna och lägger till de måltider som
                faller inom den valda tidsperioden i arrayen */
            meals.forEach(element => {
                if (element.date >= startDate) {
                    mealArr.push(element);
                }
            });
            
            // Skickar statuskod 200 och måltiderna
            res.contentType('application/json');
            const json = JSON.stringify(mealArr);
            res.status(200).send(json);
        }

        // Skickar statuskod 500 om det inte gick att hämta måltider
        if (err) {
            res.send(500).send();
        }
    })
})

// Skickar en blänkare att webbtjänsten är igång och lyssnar på porten
app.listen(port, () => {
    console.log(`App listening on port ${port}.`);
});
