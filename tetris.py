import pygame
import numpy as np

WIDTH = 300
HEIGHT = 600

SIDE_LENGTH = 30


RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
DARKBLUE = (0, 0, 180)
YELLOW = (255, 255, 0)
TURQUOIS = (0, 255, 255)
ORANGE = (255, 127.5, 0)
BLACK = (0, 0, 0)
GRAY = (100, 100, 100)

dead_rects = [pygame.Rect([-SIDE_LENGTH, 0, SIDE_LENGTH, HEIGHT]),
              pygame.Rect([WIDTH, 0, SIDE_LENGTH, HEIGHT]),
              #pygame.Rect([0, -SIDE_LENGTH, WIDTH, SIDE_LENGTH]), 
              pygame.Rect([0, HEIGHT, WIDTH, SIDE_LENGTH])]

class Block(object):


    def __init__(self, kind):
        self.kind = kind
        self.configure(kind)
        self.grid_it_up()
        #self.color = RED
        self.dead = False
        self.hard_drop = False

    def configure(self, kind):
        if kind == 'square':
            self.rects = [pygame.Rect([4 * SIDE_LENGTH, -SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([5 * SIDE_LENGTH, -SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([4 * SIDE_LENGTH, 0, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([5 * SIDE_LENGTH, 0, SIDE_LENGTH, SIDE_LENGTH])]
            self.color = YELLOW
        if kind == 'stick':
            self.rects = [pygame.Rect([4 * SIDE_LENGTH, -3 * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([4 * SIDE_LENGTH, -2 * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([4 * SIDE_LENGTH, -1 * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([4 * SIDE_LENGTH, 0, SIDE_LENGTH, SIDE_LENGTH])]
            self.color = TURQUOIS
        if kind == 'L':
            self.rects = [pygame.Rect([4 * SIDE_LENGTH, -2 * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([4 * SIDE_LENGTH, -1 * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([4 * SIDE_LENGTH, 0, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([5 * SIDE_LENGTH, 0, SIDE_LENGTH, SIDE_LENGTH])]
            self.color = ORANGE
        if kind == 'J':
            self.rects = [pygame.Rect([5 * SIDE_LENGTH, -2 * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([5 * SIDE_LENGTH, -1 * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([5 * SIDE_LENGTH, 0, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([4 * SIDE_LENGTH, 0, SIDE_LENGTH, SIDE_LENGTH])]
            self.color = DARKBLUE
        if kind == 'S':
            self.rects = [pygame.Rect([4 * SIDE_LENGTH, -2 * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([4 * SIDE_LENGTH, -1 * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([5 * SIDE_LENGTH, -1 * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([5 * SIDE_LENGTH, 0, SIDE_LENGTH, SIDE_LENGTH])]
            self.color = GREEN
        if kind == 'Z':
            self.rects = [pygame.Rect([5 * SIDE_LENGTH, -2 * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([5 * SIDE_LENGTH, -1 * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([4 * SIDE_LENGTH, -1 * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH]),
                          pygame.Rect([4 * SIDE_LENGTH, 0, SIDE_LENGTH, SIDE_LENGTH])]
            self.color = RED
    
    def grid_it_up(self):
        self.grids = self.rects[:]

    def drop(self):
        move = True
        for rect in self.rects:
            if rect.move(0, SIDE_LENGTH).collidelist(dead_rects) != -1:
                move = False
        if move:
            for rect in self.rects:
                rect.move_ip(0, SIDE_LENGTH)        
        
        else:
            self.dead = True

    def draw(self):
        for rect in self.rects:
            pygame.draw.rect(DISPLAY, self.color, rect)
        for grid in self.grids:
            pygame.draw.rect(DISPLAY, (2 * np.array(GRAY) + np.array(self.color)) / 3, grid, 2)

    def is_dead(self):
        return self.dead

    def move(self, x):
        move = True
        for rect in self.rects:
            if rect.move(x, 0).collidelist(dead_rects) != -1:
                move = False
        if move:
            for rect in self.rects:
                rect.move_ip(x, 0)

grid = []
for i in range(10):
    for j in range(20):
        grid.append(pygame.Rect((i * SIDE_LENGTH, j * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH)))

DISPLAY = pygame.display.set_mode((WIDTH, HEIGHT))

clock = pygame.time.Clock()

pygame.init()
pygame.display.set_caption('Tetris')
pygame.display.update()

running = True

speed = 0
kinds = ('square', 'stick', 'L', 'J', 'S', 'Z')
bc = 0
block = Block(kinds[bc%6])
dead_blocks = []

while running:
    
    for event in pygame.event.get():
        #print event
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            #print event.key
            if event.key == pygame.K_LEFT:
                block.move(-SIDE_LENGTH)
            if event.key == pygame.K_RIGHT:
                block.move(+SIDE_LENGTH)
            if event.key == 32:
                block.hard_drop = True
    if block.dead:
        for rect in block.rects:
            dead_rects.append(rect)
        dead_blocks.append(block)
        bc += 1
        block = Block(kinds[bc%6])
    if block.hard_drop:
        for i in range(10):
            block.drop()
    DISPLAY.fill(BLACK)
    for g in grid:
        pygame.draw.rect(DISPLAY, GRAY, g, 1)
    for dead_block in dead_blocks:
        dead_block.draw()
    block.draw()
    speed += 1
    if speed == 20:
        block.drop()
        speed = 0
    pygame.display.update()
    clock.tick(60)

pygame.quit()
