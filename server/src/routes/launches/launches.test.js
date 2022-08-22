const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('./../../utils/mongo');

describe('Launches API', () => {
    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async () => {
        await mongoDisconnect();
    })

    describe('Test GET /launches', () => {
        test('It should respond with 200 success', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        })
    });
    
    describe('Test POST /launches', () => {
        const completeLaunchData = {
            mission: 'ISS Exploration 1',
            rocket: 'Explorer143',
            target: 'Kepler-62 f',
            launchDate: '23 January 2032',
        };
    
        const launchDataWithInvalidDate = {
            mission: 'ISS Exploration 1',
            rocket: 'Explorer143',
            target: 'Kepler-62 f',
            launchDate: 'Iron Man',
        };
    
        const launchDataWithoutDate = {
            mission: 'ISS Exploration 1',
            rocket: 'Explorer143',
            target: 'Kepler-62 f',
        };
    
        test('It should respond with 201 created', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            
            expect(requestDate).toBe(responseDate);
    
            expect(response.body).toMatchObject(launchDataWithoutDate);
        })
    
        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'Missing required launch data'
            });
        })
        test('It should catch invalid dates', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'Invalid launch date'
            });
        })
    })
});