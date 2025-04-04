import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './components/App';
import './styles.css';

const rootNode = document.getElementById('root');
if (rootNode !== null) {
    const root = ReactDOM.createRoot(rootNode);
    root.render(
        <HelmetProvider>
            <App />
        </HelmetProvider>
    );
} else {
    console.error("No root node found.");
}