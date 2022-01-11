// Hämtar express
const express = require('express');
// Läser in express
const app = express();
// Hämtar body-parser
const bodyParser = require('body-parser');
const {urlencoded} = require('body-parser');
// Väljer port
const port = 3030;
// Definierar mapp för visning av filer
app.use(express.static('public'));
// Läser in body-parser för att kunna lägga till och uppdatera kurser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Hämtar mongoose
const mongoose = require('mongoose');
// URL till databasen
const mongoDB = 'mongodb://localhost:27017/foodDiary';
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
// Inloggning (valideringen sker på frontend-sidan)
app.get('/login', function(req, res) {
    // Söker igenom collection
    user.find(function(err, users) {
            // Skickar ett felmeddelande om det inte gick att hämta användaruppgifter
            if(err) {
                message.error = 'Det gick inte att hämta användaruppgifter: ' + err
                + '. Försök igen senare.';
                res.contentType('application/json');
                const json = JSON.stringify(message);
                res.status(500).send(json);
            // Skickar alla användare
            } else {
                res.contentType('application/json');
                const json = JSON.stringify(users);
                res.status(200).send(json);
            }
        }
    );
});

// Registrering
app.post('/signup', function(req, res) {
    // Läser in alla uppgifter från fetch-anropet
    const body = req.body;
    let message = {};

    // Ny användare, lägger till uppgifterna som skickats med i fetch-anropet
    const document = new user({
        username:  body.username,
        password:  body.password,
        firstName: body.firstName,
        lastName:  body.lastName,
        email:     body.email,
    });
    // Lägger till dokumentet
    document.save(function(err) {
        // Skickar ett felmeddelande om det inte gick att lägga till användaren
        if (err) {
            res.contentType('application/json');
            message.error = 'Registreringen misslyckades: ' + err 
                + '. Försök igen senare.';
            const json = JSON.stringify(message);
            res.status(500).send(json);
        // Skickar ett bekräftelsemeddelande vid lyckad registrering
        } else {
            res.contentType('application/json');
            message.confirm = 'Du är registrerad.';
            const json = JSON.stringify(message);
            res.status(200).send(json);
        }
    })
});

// Hämtar alla livsmedel
app.get('/foods', function(req, res) {
    let message = {};
    // Söker igenom collection
    food.find(function(err, foods) {
        // Skickar ett felmeddelande om det inte gick att hämta livsmedel
        if (err) {
            message.error = 'Det gick inte att hämta livsmedel: ' + err
                + '. Försök igen senare.';
            res.contentType('application/json');
            const json = JSON.stringify(err);
            res.status(500).send(json);
        // Skickar alla livsmedel
        } else {
            res.contentType('application/json');
            const json = JSON.stringify(foods);
            res.status(200).send(json);
        }
    });
});

// Hämtar alla livsmedel inom en viss kategori
app.get('/foods/:category', function(req, res) {
    // Läser in kategorin som skickats med fetch-anropet
    const category = req.params.category;
    let message = {};
    // Söker igenom collection
    food.find(
        {category: category}, 
        function(err, document) {
        // Skickar ett felmeddelande om det inte gick att hämta livsmedel
        if (err) {
            message.error = 'Det gick inte att hämta livsmedel: ' + err
                + '. Försök igen senare.';
            res.contentType('application/json');
            const json = JSON.stringify(message);
            res.status(500).send(json);
        // Skickar alla livsmedel inom kategorin
        } else {
            res.contentType('application/json');
            const json = JSON.stringify(document);
            res.status(200).send(json);
        }
    });
});

// Hämtar livsmedel baserat på namn
app.get('/foods/:name', function(req, res) {
    // Läser in namnet från fetch-anropet
    const name = req.params.name;
    let message = {};
    // Söker igenom collection
    food.find(
        {name: name}, 
        function(err, document) {
        // Skickar ett felmeddelande om livsmedlet inte finns
        if (err) {
            message.error = 'Det gick inte att hitta livsmedlet: ' + err;
            res.contentType('application/json');
            const json = JSON.stringify(message);
            res.status(404).send(json);
        // Skickar livsmedlet
        } else {
            res.contentType('application/json');
            const json = JSON.stringify(document);
            res.status(200).send(json);
        }
    });
});

// Hämtar livsmedel baserat på namn och kategori
app.get('/foods/:name/:category', function(req, res) {
    // Läser in namnet och kategorin från fetch-anropet
    const name = req.params.name;
    const category = req.params.category;
    let message = {};
    // Söker igenom collection
    food.find(
        {name: name, category: category}, 
        function(err, document) {
        // Skickar ett felmeddelande om livsmedlet inte finns
        if (err) {
            message.error = 'Kunde inte hitta några livsmedel inom den valda kategorin: ' 
                + err;
            res.contentType('application/json');
            const json = JSON.stringify(message);
            res.status(404).send(json);
        // Skickar livsmedlet
        } else {
            res.contentType('application/json');
            const json = JSON.stringify(document);
            res.status(200).send(json);
        }
    });
});

// Lägger till livsmedel
app.post('/foods', function(req, res) {
    // Läser in uppgifterna från fetch-anropet
    const body = req.body;
    let message = {};
    // Nytt livsmedel, lägger till uppgifterna från fetch-anropet
    const document = new food({
        name:          body.name,
        category:      body.category,
        calories:      body.calories,
        protein:       body.protein,
        carbohydrates: body.carbohydrates,
        fats:          body.fats,
        salt:          body.salt,
        water:         body.water,
        ash:           body.ash
    });
    // Lägger till livsmedlet
    document.save(function(err) {
        // Skickar ett felmeddelande om det inte gick att lägga till livsmedlet
        if (err) {
            message.error = 'Det gick inte att lägga till livsmedlet: ' + err
            + '. Försök igen senare.';
            res.contentType('application/json');
            const json = JSON.stringify(message);
            res.status(500).send(json);
        // Skickar ett bekräftelsemeddelande vid lyckad lagring
        } else {
            message.confirm = 'Livsmedlet har lagts till.';
            res.contentType('application/json');
            const json = JSON.stringify(message);
            res.status(200).send(json);
        }
    });
});

// Lägger till måltider och livsmedel som saknas i databasen
app.post('/meals', function(req, res) {
    // Läser in uppgifterna från fetch-anropet
    const body = req.body;
    let message = {};
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
        // Skickar ett felmeddelande om det inte gick att lägga till måltiden
        if (err) {
            message.error = 'Det gick inte att lägga till måltiden: ' + err
            + '. Försök igen senare.';
            res.contentType('application/json');
            const json = JSON.stringify(message);
            res.status(500).send(json);
        // Skickar ett bekräftelsemeddelande vid lyckad lagring
        } else {
            message.confirm = 'Måltiden har lagts till.';
            res.contentType('application/json');
            const json = JSON.stringify(message);
            res.status(200).send(json);
        }
    });
    // Livsmedel som inte redan finns i databasen läggs till automatiskt
    // addFoodToDB(body);
});

// Hämtar alla måltider för en användare
app.get('/meals/:user', function(req, res) {
    // Läser in användarnamnet från fetch-anropet
    const user = req.params.user;
    let message = {};
    // Söker igenom collection
    meal.find({username: user}, function(err, meals) {
        // Skickar ett felmeddelande om det inte gick att hämta måltider
        if (err) {
            message.error = 'Det gick inte att hämta måltider: ' + err
            + '. Försök igen senare.';
            res.contentType('application/json');
            const json = JSON.stringify(message);
            res.status(500).send(json);
        // Skickar alla måltider
        } else {
            res.contentType('application/json');
            const json = JSON.stringify(meals);
            res.status(200).send(json);
        }
    });
});

// Uppdaterar måltider
app.put('/meals/:ID/:user', function(req, res) {
    // Läser in ID, användarnamn och body från fetch-anropet
    const ID = req.params.ID;
    const user = req.params.user;
    const body = req.body;
    let message = {};
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
        // Skickar ett felmeddelande om det inte gick att uppdatera måltiden
        if(err) {
            message.error = 'Det gick inte att uppdatera måltiden: ' + err
            + '. Försök igen senare.';
            res.contentType('application/json');
            const json = JSON.stringify(message);
            res.status(500).send(json);
        // Skickar ett bekräftelsemeddelande vid lyckad uppdatering
        } else {
            message.confirm = 'Måltiden har uppdaterats.';
            res.contentType('application/json');
            const json = JSON.stringify(message);
            res.status(200).send(json);
        }
    })
})

// Raderar måltider
app.delete('/meals/:ID/:user', function(req, res) {
    // Läser in ID och användarnamn från fetch-anropet
    const ID = req.params.ID;
    const user = req.params.user;
    let message = {};
    // Raderar måltiden
    meal.deleteOne({mealID: ID, username: user}, function(err) {
        // Skickar ett felmeddelande om det inte gick att radera måltiden
        if (err) {
            message.error = 'Det gick inte att radera måltiden: ' + err
            + '. Försök igen senare.';
            res.contentType('application/json');
            const json = JSON.stringify(message);
            res.status(500).send(json);
        // Skickar ett bekräftelsemeddelande vid lyckad borttagning
        } else {
            message.confirm = 'Måltiden har raderats.';
            res.contentType('application/json');
            const json = JSON.stringify(message);
            res.status(200).send(json);
        }
    });
});

// Hämtar måltider för en viss tidsperiod
app.get('/meals/:user/:range', function(req, res) {
    // Läser in användarnamn och vald tidsperiod från fetch-anropet
    const user = req.params.user;
    const range = req.params.range;
    let message = {};
    // Lagrar dagens datum
    let today = new Date();
    let startDate;
    let mealArr = [];

    switch(range) {
        case 'Senaste månaden':
            startDate = today.setDate(today.getDate() - 30);
            startDate.toISOString().slice(0, 10);
        break;

        case 'Senaste tre månaderna':
            startDate = today.setDate(today.getDate() - 90);
            startDate.toISOString().slice(0, 10);
        break;

        case 'Senaste halvåret':
            startDate = today.setDate(today.getDate() - 120);
            startDate.toISOString().slice(0, 10);
        break;

        case 'Senaste året':
            startDate = today.setDate(today.getDate() - 365);
            startDate.toISOString().slice(0, 10);
        break;

        default:
            startDate = today.setDate(today.getDate() - 7);
            startDate.toISOString().slice(0, 10);
        break;
    }

    meal.find({username: user}, function(err, meals) {
        if (err) {
            // Skickar ett felmeddelande om det inte gick att hämta måltider
            if (err) {
                message.error = 'Det gick inte att hämta måltider: ' + err
                + '. Försök igen senare.';
                res.contentType('application/json');
                const json = JSON.stringify(message);
                res.status(500).send(json);
            // Skickar alla måltider
            } else {
                meals.forEach(element => {
                    if (element.date <= startDate) {
                        mealArr.push(meal);
                    }
                });
                res.contentType('application/json');
                const json = JSON.stringify(mealArr);
                res.status(200).send(json);
            }
        }
    })
})

function addFoodToDB(body) {
    let percentage;
    if (body.meal.quantity > 100) {
        percentage = 100 / body.meal.quantity;
        body.meal.forEach(element => { 
            food.find(element.name, function(err) {
                if (!err) {
                    const item = new food({
                        name:     element.name,
                        category: element.category,
                        calories: element.calories * percentage,
                        protein:  element.protein * percentage,
                        fats:     element.fats * percentage,
                        salt:     element.salt * percentage,
                        water:    element.water * percentage,
                        ash:      element.ash * percentage
                    });
                    item.save();
                }
            });
        });
    } else if (body.meal.quantity < 100) {
        percentage = body.meal.quantity / 100;
        body.meal.forEach(element => { 
            food.find(element.name, function(err) {
                if (!err) {
                    const item = new food({
                        name:     element.name,
                        category: element.category,
                        calories: element.calories * percentage,
                        protein:  element.protein * percentage,
                        fats:     element.fats * percentage,
                        salt:     element.salt * percentage,
                        water:    element.water * percentage,
                        ash:      element.ash * percentage
                    });
                    item.save();
                }
            });
        });
    } else if (body.meal.quantity == 100) {
        body.meal.forEach(element => { 
            food.find(element.name, function(err) {
                if (!err) {
                    const item = new food({
                        name:     element.name,
                        category: element.category,
                        calories: element.calories,
                        protein:  element.protein,
                        fats:     element.fats,
                        salt:     element.salt,
                        water:    element.water,
                        ash:      element.ash
                    });
                    item.save();
                }
            });
        });
    }
}

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
