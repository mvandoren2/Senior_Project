export default function fetchAllMemebers() {
    return fetch('http://localhost:8080/api/members/')
        .then(response => response.json())
}    
