#include<stdio.h>
#include<string.h>
#include <stdbool.h>
typedef struct {
    char name[50];
    int age;
    float gpa;
    bool isFulltime;
}student;

void printStudent(student student);

int main (){
//struct--- is a custom container that holds multiple pieces of related information.
// similar to objects in other languages
 student student1={ "mwesigye", 43, 4.89, true};
student student2={0};
strcpy(student2.name, "shelby");
student2.age=30;
student2.gpa=5;
student2.isFulltime=true;
//printf("%s\n", student2.name);
//printf("%d\n", student2.age);
//printf("%.3f\n", student2.gpa);

printStudent(student1);
printf("\n");
printStudent(student2);


}
void printStudent(student student){
printf("%s\n", student.name);
printf("%d\n", student.age);
printf("%.3f\n", student.gpa);}