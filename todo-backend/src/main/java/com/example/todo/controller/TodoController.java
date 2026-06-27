package com.example.todo.controller;


import com.example.todo.model.Todo;
import com.example.todo.repository.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "http://localhost:5173")
public class TodoController {

    @Autowired
    private TodoRepository repo;

    @GetMapping
    public List<Todo> getAll() { return repo.findAll();}

    @PostMapping
    public Todo create(@RequestBody Todo todo) {return repo.save(todo);}

    @PutMapping("/{id}")
    public Todo update(@PathVariable Long id, @RequestBody Todo todo) {
        todo.setId(id);
        return repo.save(todo);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {repo.deleteById(id);}
}
