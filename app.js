const axios = require('axios');
async function app() {
    var data = []
    var fields = []
    var id = {}
    var idDatabase = ""
    var cursor = ""
    var response = []

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

    async function pipefyRequest(query) {
        const res = await fetch('https://api.pipefy.com/graphql', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyIjp7ImlkIjozMDE5OTU2ODEsImVtYWlsIjoiZmVsaXBlcm9zZW5la0BnbWFpbC5jb20iLCJhcHBsaWNhdGlvbiI6MzAwMTQyMDIwfX0.JugAF92MqbUV_fLVKEcF5jUI3G4G2hlAmLeBJ-dEfsEIlX3gdKO1IfbQRUYvHvAk569vuD9K_zCrKylY6R6agw",
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query
            })
        })

        const response = await res.json()
        return response
    }

    try {

        for (let index = 0; index < 1000; index++) {

            if (cursor != "") {
                response = await pipefyRequest('{allCards(pipeId:301587647,after:"' + cursor + '") { edges { node { id, fields {name value} } } pageInfo {startCursor }} }')
                data = response.data.allCards.edges
                cursor = response.data.allCards.pageInfo.startCursor
            } else {
                response = await pipefyRequest('{allCards(pipeId:301587647) { edges { node { id, fields {name value} } } pageInfo {startCursor }} }')
                data = response.data.allCards.edges
                cursor = response.data.allCards.pageInfo.startCursor
            }

            console.log(data.length)
            console.log(cursor)
            await delay(3000)

            data.map(async card => { // array cards
                fields = card.node.fields
                


                fields.map(function (field, i) { // array fields
                    if (field.name == "Conexão de database título") {

                        idDatabase = field.value

                        if (idDatabase.includes("\\t")) {
                            idDatabase = idDatabase.split("\\t").join(" ")
                            idDatabase = idDatabase.trimStart()
                        }
                        idDatabase = idDatabase.split("[").join(" ")
                        idDatabase = idDatabase.split("]").join(" ")
                        idDatabase = idDatabase.split('"').join(" ")

                        idDatabase = idDatabase.trimStart()
                        
                    }

                    return idDatabase
                })

                response = await pipefyRequest('{table_records(table_id: 301585673, search:{title:"' + idDatabase + '"}) { edges { node { id title } } } }')
                var cardInfo = response.data.table_records.edges[0].node
                console.log(card.node.id)
                console.log(cardInfo)


                idDatabase = ""


            })

        }

    }
    catch { app() }

}




app()

