import connectDB from './mongo.config.js';

const initiateDB = async()=>{
    try {
        await connectDB();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
};

export { initiateDB };