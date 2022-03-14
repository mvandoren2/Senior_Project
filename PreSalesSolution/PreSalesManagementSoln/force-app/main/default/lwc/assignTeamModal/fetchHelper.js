export default function fetchAllMemebers() {
    return fetch('http://localhost:8080/api/get_all_members/')
        .then(response => response.json())
}    
