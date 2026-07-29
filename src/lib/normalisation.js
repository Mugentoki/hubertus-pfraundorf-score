export default function normalizeResultData(resultData) {
    const normalizedData = {
        date: resultData.result._attributes.date,
        name: resultData.result._attributes.name,
        groups: [
            {
                name: "All Competitors",
                competitors: normalizeCompetitors(resultData.result.shooters.shooter)
            }
        ]
    }

    return normalizedData;
}

function normalizeCompetitors(originalShooters) {
    const competitors = [];

    originalShooters.forEach((shooter) => {
        const competitor = {
            clubsName: shooter._attributes.clubsname,
            fullName: shooter._attributes.fullname,
            statistics: {
                bester_teiler: shooter._attributes.bester_teiler,
                totalScore: shooter._attributes.totalscore_avg,
                totalScoreDecimal: shooter._attributes.totalscore_avg_dec
            },
            seriesCollections: normalizeSeries(shooter.shots.series)
        }

        competitors.push(competitor);
    });

    return competitors;
}

function normalizeSeries(originalSeries) {
    const series = [];

    originalSeries.forEach((serieData) => {
        const serie = {
            bestTeiler: serieData._attributes.bester_teiler,
            totalScore: serieData._attributes.totalscore,
            totalScoreDecimal: serieData._attributes.totalscore_d,
            timestamp: getSerieTimestamp(serieData),
            shots: normalizeShots(serieData.shot)
        }

        series.push(serie);
    });

    return series;
}

function normalizeShots(originalShots) {
    const shots = [];

    originalShots.forEach((shotData) => {
        const shot = {
            datetime: getShotTimestamp(shotData),
            scoreDecimal: shotData._attributes.dec,
            score: shotData._attributes.full,
            type: shotData._attributes.disktyp,
            teiler: shotData._attributes.teiler
        }

        shots.push(shot);
    })

    return shots;
}

/**
 * Returns the first shot datetime as timestamp
 * 
 * @param {*} serie 
 * @returns 
 */
function getSerieTimestamp(serie) {
    if (serie.shot.length > 0) {        
        return getShotTimestamp(serie.shot[0]);
    }

    return null;
}

function getShotTimestamp(shot) {
    const parsedDateString = parseGermanDateString(shot._attributes.datetime);

    return Date.parse(parsedDateString);
}

/**
 * Takes the provided datestring from DISAG and parses it
 * into a string that JS Date object understands
 * 
 * @param {*} dateString 
 * @returns 
 */
function parseGermanDateString(dateString) {
    const [date, time] = dateString.split(" ");
    const [day, month, year] = date.split(".");

    return new Date(
        `${year}-${month}-${day}T${time}`
    );
}