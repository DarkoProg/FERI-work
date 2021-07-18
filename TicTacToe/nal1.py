import numpy as np
import copy
from random import *

playerTurn = True
TicTacToe = np.zeros(9, dtype = int)
igralec = ""
rac = ""
Game = True

def printTicTacToe():
    j = 1
    print("\n  ---------------")
    for i in range(len(TicTacToe)):
        if i%3 == 0:
            print(str(j)+" ", end='')
            j = j+1
        if TicTacToe[i] == 0:
            print("|   |", end = '')
        elif TicTacToe[i] == 1:
            print("| x |", end = '')
        elif TicTacToe[i] == 2:
            print("| o |", end = '')

        if i%3 == 2:
            print("\n  ---------------")
    print("    1    2    3")



def hevristika(P):
    h = 0
    zmaga = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    for stanja in zmaga:
 
        x = 0
        o = 0

        for i in stanja:
            if P[i] == 1:
                x = x + 1
            elif P[i] == 2:
                o = o + 1
        if x == 2 and o == 0:
            h = h + 5
        elif x == 0 and o == 2:
            h = h - 5
        elif x == 1 and o == 0:
            h = h + 1
        elif x == 0 and o == 1:
            h = h - 1
        
        if x == 3:
            return 1000
        elif o == 3:
            return -1000
    
    return h




def genPoteze(P):                      #gen all possible moves
    poteze = []
    for i in range(len(P)):
        if P[i] == 0:
            poteze.append(i)
    return poteze




def alfabeta(P, ig, d, a, b):                                                   # P - current board
    if hevristika(P) == 1000 or hevristika(P) == -1000 or d == 0:               # ig - current player (min-max)
        return (hevristika(P), -1)                                              # d - depth
                                                                                # a - alpha
    poteza = -1                                                                 # b - beta

    if ig == "mx":
        ocena = -10000000
    else:
        ocena = 10000000

    M = genPoteze(P)

    for i in range(len(M)):
        temp = np.copy(P)
        if(ig == "mx"):
            temp[M[i]] = 1
            o, m = alfabeta(temp, "mi", d-1, -b, -a)
        elif(ig == "mi"):
            temp[M[i]] = 2
            o, m = alfabeta(temp, "mx", d-1, -b, -a)
    



        if o > ocena and ig == "mx":                                            #calculating price to victory
            ocena = o
            poteza = M[i]
            if ocena > a:
                a = ocena
            
        elif o < ocena and ig == "mi":
            ocena = o
            poteza = M[i]
            if ocena < b:
                b = ocena
            

        if a >= b:                                                             #don't look into this branch further
            return(ocena, poteza)

    return(ocena, poteza)



globina = int(input("globina: "))

igralec = input("kri -> krizec\nkro -> krozec\nkrizec zacne prvi!\n")
if igralec == "kri":
    rac = "kro"
else:
    rac = "kri"

if rac == "kri":
    TicTacToe[4] = 1



while True:
    printTicTacToe()
    if abs(hevristika(TicTacToe)) == 1000:                                     #end game if the game is over
        break

    v = int(input("izberite vrstico: "))
    s = int(input("izberite stolpec: "))
    if igralec == "kri":
        TicTacToe[3*(v-1)+(s-1)] = 1
    else:
        TicTacToe[3*(v-1)+(s-1)] = 2
    

    if rac == "kri":                                                           #start alghoritem depending on who is the player and who is the computer
        oc, po = alfabeta(np.copy(TicTacToe), "mx", globina, -10000000, 10000000)
        if po == -1:
            printTicTacToe()
            break
        TicTacToe[po] = 1
    else:
        oc, po = alfabeta(np.copy(TicTacToe), "mi", globina, -10000000, 10000000)
        if po == -1:
            printTicTacToe()
            break
        TicTacToe[po] = 2
